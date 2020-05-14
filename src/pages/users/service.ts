import request, { extend } from 'umi-request';
import { message } from 'antd';
import { FormValues } from './data.d';

//errorHandler和extendRequest是从umi-request的官方文档https://github.com/umijs/umi-request/blob/master/README.md的Error handling中复制过来的
const errorHandler = function(error: any) {
  if (error.response) {
    if (error.response.status > 400) {
      message.error(error.data.message ? error.data.message : error.data);
    }
  } else {
    // The request was made but no response was received or error occurs when setting up the request.
    // console.log(error.message);
    message.error('Network Error.');
  }

  throw error; // If throw. The error will continue to be thrown.

  // return {some: 'data'}; If return, return the value as a return. If you don't write it is equivalent to return undefined, you can judge whether the response has a value when processing the result.
  // return {some: 'data'};
};

const extendRequest = extend({ errorHandler });

//从后端接口获取数据的http请求getRemoteList（一定记得要用export导出）
export const getRemoteList = async ({
  page,
  per_page,
}: {
  page: number;
  per_page: number;
}) => {
  return extendRequest(
    `http://public-api-v1.aspirantzhang.com/users?page=${page}&per_page=${per_page}`,
    {
      method: 'get',
    },
  )
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      return false;
    });
};

//编辑（更改）数据的http请求editRecord
export const editRecord = async ({
  id,
  values,
}: {
  id: number;
  values: FormValues;
}) => {
  return extendRequest(`http://public-api-v1.aspirantzhang.com/users/${id}`, {
    method: 'put',
    data: values,
  })
    .then(function(response) {
      return true;
    })
    .catch(function(error) {
      return false;
    });
};

//添加数据的http请求addRecord
export const addRecord = async ({ values }: { values: FormValues }) => {
  return extendRequest(`http://public-api-v1.aspirantzhang.com/users/`, {
    method: 'post',
    data: values,
  })
    .then(function(response) {
      return true;
    })
    .catch(function(error) {
      return false;
    });
};

//删除数据的http请求deleteRecord
export const deleteRecord = async ({ id }: { id: number }) => {
  return extendRequest(`http://public-api-v1.aspirantzhang.com/users/${id}`, {
    method: 'delete',
  })
    .then(function(response) {
      return true;
    })
    .catch(function(error) {
      return false;
    });
};
