import React, { useState, useMemo } from 'react'
import { TextField } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import Layout from 'components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTry, useTryAsync } from "no-try";
import { createReq } from 'lib/posts'

export async function getStaticPaths() {
  return {
    paths: [
      { params: { actionType: 'register' } },
      { params: { actionType: 'login' } }
  ],
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  // const postData = await getPostData(params.actionType)
  return {
    props: {
      
    }
  }
}

function registerOrLoginPage(props) {
  const router = useRouter()
  const { actionType } = router.query
  const [loading, setloading] = useState(false);
  const pageObj = useMemo(() => actionType === 'register' ? {
    url: 'https://hoodwink.medkomtek.net/api/register',
    title: 'Register',
    actionFunc: () => {
      router.push('/auth/login')
    }
  }:{
    url: 'https://hoodwink.medkomtek.net/api/auth/login',
    title: 'Login',
    actionFunc: (token) => {
      sessionStorage.setItem('token', token)
      router.push('/')
    }
  }, [actionType]);
  console.log(pageObj)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setloading(true)
    const formData = new FormData(event.target)
    event.target.reset()

    const [error, result] = await useTryAsync(() => createReq({
      method: 'POST',
      url: pageObj.url,
      data: formData,
      formDataAlreadyExist: true,
      registerOrLogin: true,
    }))

    if(result.data.token || result.data.success){
      pageObj.actionFunc(result.data.token)
    }
    
    setloading(false)
  };
  


  return (
    <Layout>
      <Head>
        <title>{pageObj.title}</title>
      </Head>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField
          autoFocus
          type="email"
          margin="dense"
          name="email"
          label="email"
          fullWidth
          variant="standard"
        />
        <TextField
          type="password"
          margin="dense"
          name="password"
          label="password"
          fullWidth
          variant="standard"
        />
        <LoadingButton loading={loading} type='submit'>{pageObj.title}</LoadingButton>
      </form>
    </Layout>
  )
}

export default registerOrLoginPage