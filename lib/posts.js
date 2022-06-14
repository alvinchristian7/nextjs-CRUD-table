import axios from 'axios'
import { useTry, useTryAsync } from "no-try";
var FormData = require('form-data');

export async function createReq({ data, formDataAlreadyExist, registerOrLogin, ...params }) {
  let finalData
  if (formDataAlreadyExist) {
    finalData = data
  } else {

    finalData = new FormData();
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const value = data[key];
        finalData.append(key, value);

      }
    }
  }

  const [error, result] = await useTryAsync(() => axios({
    ...params,
    headers: {
      'content-type': 'multipart/form-data',
      ...!registerOrLogin && { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    },
    data: finalData,
  }));

  if(result) return Promise.resolve(result)
  else return Promise.reject(error)
}
