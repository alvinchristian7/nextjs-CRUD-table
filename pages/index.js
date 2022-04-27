import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { IconButton, Input, Button, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { createReq } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import cn from 'classnames'
import { useTry, useTryAsync } from "no-try";
import { useRouter } from 'next/router'

const reqConst = {
  'CREATE': {
    method: 'POST',
    url: 'https://hoodwink.medkomtek.net/api/item/add',
    title: 'Add Product',
  },
  'UPDATE': {
    method: 'POST',
    url: 'https://hoodwink.medkomtek.net/api/item/update',
    title: 'Edit Product',
  },
  'DELETE': {
    method: 'POST',
    url: 'https://hoodwink.medkomtek.net/api/item/delete',
  },
  'READ': {
    method: 'GET',
    url: 'https://hoodwink.medkomtek.net/api/items',
  },
  'READ_BY_SKU': {
    method: 'POST',
    url: 'https://hoodwink.medkomtek.net/api/item/search',
  },
}

export async function getServerSideProps(context) {
  const [error, result] = await useTryAsync(() => createReq(reqConst.READ))
  return {
    props: {
      allTableData: result
    }
  }
}

export default function Home({ allTableData }) {
  const router = useRouter()
  
  const [open, setOpen] = useState(false);
  const [searchBySKU, setsearchBySKU] = useState('');
  const [actionName, setactionName] = useState('CREATE');
  const [submitData, setsubmitData] = useState({});
  const [tableData, settableData] = useState([]);

  const actionObj = reqConst[actionName]
  
  const handleClickOpen = (enumStr, reqBody) => {
    if(reqBody) setsubmitData(reqBody)
    if(['CREATE', 'UPDATE'].includes(enumStr)){
      setactionName(enumStr)
      setOpen(true)
    }
    else {
      if(enumStr === 'READ_BY_SKU')
      getTableDataBySKU(reqBody)
      else
      postData({...reqConst[enumStr], data: reqBody})
    }
  };
  
  const handleClose = async () => {
    setOpen(false);
    setsubmitData({})
  };

  const getTableDataBySKU = async (reqBody) => {
    const [error, result] = await useTryAsync(() => createReq({...reqConst.READ_BY_SKU, data: reqBody}))
    if(result.data.success !== false)
      settableData([result.data])
    else settableData([])
  };

  const getTableData = async () => {
    const [error, result] = await useTryAsync(() => createReq(reqConst.READ))
    settableData(result.data)
  };

  const postData = async (paramObj) => {
    const {title, ...theObj} = actionObj
    const [error, result] = await useTryAsync(() => createReq({
      data: submitData,
      ...theObj,
      ...paramObj,
    }))

    if(result) getTableData()

    setOpen(false);
    setsubmitData({})
  };

  const handleSubmit = async (event) => {
    if(event)
      event.preventDefault()

    postData()
  };

  useEffect(async () => {
    const token = sessionStorage.getItem('token')
    if(!token) {
      // router.push('/auth/login')
    } else {
      getTableData()
    }
  }, [])

  const columns = [
    { field: 'sku', headerName: 'SKU', width: 150 },
    { field: 'product_name', headerName: 'Product Name', width: 250},
    { field: 'actions', headerName: 'Actions', width: 180, renderCell: (params) => (
      <div className={cn('flex gap-2')}>
          <Button onClick={()=>handleClickOpen('UPDATE', params.row)}>Edit</Button>
          {'|'}
          <Button onClick={()=>handleClickOpen('DELETE', params.row)}>Delete</Button>
        </div>
    ) },
  ];

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Dialog open={open} onClose={handleClose}>
        <form id="addOrEditProduct" onSubmit={handleSubmit} encType="multipart/form-data">
          <DialogTitle>{actionObj.title || 'Add Product'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              type="text"
              margin="dense"
              name="sku"
              label="sku"
              fullWidth
              value={submitData.sku}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, sku: val}))}
              variant="standard"
            />
            <TextField
              type="text"
              margin="dense"
              name="product_name"
              label="product_name"
              fullWidth
              value={submitData.product_name}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, product_name: val}))}
              variant="standard"
            />
            <TextField
              type="number"
              margin="dense"
              name="qty"
              label="qty"
              fullWidth
              value={submitData.qty}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, qty: val}))}
              variant="standard"
            />
            <TextField
              type="number"
              margin="dense"
              name="price"
              label="price"
              fullWidth
              value={submitData.price}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, price: val}))}
              variant="standard"
            />
            <TextField
              type="text"
              margin="dense"
              name="unit"
              label="unit"
              fullWidth
              value={submitData.unit}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, unit: val}))}
              variant="standard"
            />
            <TextField
              type="number"
              margin="dense"
              name="status"
              label="status"
              fullWidth
              value={submitData.status}
              onChange={({target: {value: val}}) => setsubmitData(prev => ({...prev, status: val}))}
              inputProps={{
                min: 0,
                max: 1,
              }}
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type='submit'>Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
      <section className={cn(utilStyles.headingMd, 'flex gap-2 justify-end mb-4')}>
        <Link href={"/auth/register"}><a className='font-bold'>Register</a></Link>
        {'|'}
        <Link href={"/auth/login"}><a className='font-bold'>Login</a></Link>
      </section>
      <section className={cn(utilStyles.headingMd, 'flex justify-between mb-4')}>
        <div>
          <Input value={searchBySKU} onChange={({target: {value}})=>setsearchBySKU(prev => value)} placeholder="Search by SKU" />
          <IconButton onClick={()=>{
            if(searchBySKU === '')
            getTableData()
            else
            handleClickOpen('READ_BY_SKU', {sku: searchBySKU})
          }}>
            <SearchIcon />
          </IconButton>
        </div>
        <Button onClick={()=>handleClickOpen('CREATE')} startIcon={<AddIcon />}>Add Product</Button>
      </section>
      <section className={cn(utilStyles.headingMd, utilStyles.padding1px)}>
        <div style={{ height: '70vh', width: '100%' }}>
          <DataGrid rows={tableData} columns={columns} />
        </div>
      </section>
    </Layout>
  )
}