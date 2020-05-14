//测试页面是否能够正常显示
// export default () => {
//     return <div>page is ok</div>;
// };

//引入各种组件
import React, { useState, useRef, FC } from 'react';
import {
  Table,
  Tag,
  Modal,
  Button,
  Popconfirm,
  Pagination,
  message,
} from 'antd';
import ProTable, { ProColumns, TableDropdown } from '@ant-design/pro-table';
import { connect, Dispatch, Loading, UserState, useModel } from 'umi';
import UserModal from './components/UserModal';
import { addRecord, editRecord } from './service';
import { SingleUserType, FormValues } from './data.d';

//声明接口
interface UserPageProps {
  users: UserState;
  dispatch: Dispatch;
  userListLoading: boolean;
}

//函数组件(本次demo大部分使用函数组件)
const UserListPage: FC<UserPageProps> = ({
  users,
  dispatch,
  userListLoading,
}) => {
  //设置modalVisible的默认值为false，即UserModal窗口默认是关闭的，可以通过修改setModalVisible的值是true或false来决定UserModal窗口是否显示
  const [modalVisible, setModalVisible] = useState(false);
  //设置confirmLoading的默认值为false，即点击UserModal窗口中的OK后，是否会有一个圆形的加载提示。可以通过修改setConfirmLoading的值来决定圆形的加载提示是否显示。
  const [confirmLoading, setConfirmLoading] = useState(false);
  //设置record的默认值为undefined
  const [record, setRecord] = useState<Partial<SingleUserType> | undefined>(
    undefined,
  );

  const columns: ProColumns<SingleUserType>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'digit',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      valueType: 'text',
      render: (text: any) => <a>{text}</a>,
    },
    {
      title: 'Create_Time',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      key: 'create_time',
    },
    {
      title: 'Action',
      key: 'action',
      valueType: 'option',
      render: (text: any, record: SingleUserType) => [
        <a
          onClick={() => {
            editHandler(record);
          }}
        >
          Edit
        </a>,
        <Popconfirm
          title="Are you sure delete this user?"
          onConfirm={() => {
            deleteHandler(record.id);
          }}
          okText="Yes"
          cancelText="No"
        >
          <a>Delete</a>
        </Popconfirm>,
      ],
    },
  ];

  //定义显示子组件（UserModal窗口对话框）的函数，给edit等按钮使用,其中也包括将本行内的值（record）传进子组件中
  const editHandler = (record: SingleUserType) => {
    setModalVisible(true);
    setRecord(record);//把record的值传进去
  };

  //定义关闭子组件（UserModal窗口对话框）的函数，可以考虑给UserModal窗口对话框的ok和cancel按钮使用
  const closeHandler = () => {
    setModalVisible(false);
  };

  //定义主界面delete删除按钮的函数
  const deleteHandler = (id: number) => {
    dispatch({
      type: 'users/delete',
      payload: {
        id,
      },
    });
  };

  //定义主界面add添加按钮的函数
  const addHandler = () => {
    setModalVisible(true);
    setRecord(undefined);
  };

  //定义UserModal中，按ok按钮后，主页面发生事件的函数
  const onFinish = async (values: FormValues) => {
    setConfirmLoading(true);
    let id = 0;//让id默认值为0

    if (record) {//如果record存在
      id = record.id;//获取record中的id
    }

    //editRecord操作和addRecord操作的逻辑很像，所以多声明一个变量serviceFun。在列表数据中，edit本来就是有id的，而add本来是没有id的。当后端传回id时，判断是edit操作，当后端传回的数据没有id时，判断是add操作
    let serviceFun;
    if (id) {
      serviceFun = editRecord;
    } else {
      serviceFun = addRecord;
    }

    //当编辑或添加数据时，后端请求成功后，UserModal窗口正常关闭；后端请求失败时（编辑或添加数据失败的时候），点击OK之后UserModal窗口不会关闭
    const result = await serviceFun({ id, values });
    if (result) {
      setModalVisible(false);
      message.success(`${id === 0 ? 'Add' : 'Edit'} Successfully.`);
      //添加成功信息（注意在antd中引用message），此处`${id === 0 ? 'Add' : 'Edit'} Successfully.`表示，当id为0时，提示Add Successfully，当id是其他值时，提示Edit Successfully（下方else返回的是失败信息，同理）
      reloadHandler();//成功后重载数据
      setConfirmLoading(false);
    } else {
      setConfirmLoading(false);
      message.error(`${id === 0 ? 'Add' : 'Edit'} Failed.`);
    }
  };


  //定义重载数据的函数（刷新页面的函数，即重新dispatch一下后端数据）
  const reloadHandler = () => {
    dispatch({
      type: 'users/getRemote',//注意此处getRemote是从model.ts下的UserModel中引用过来的，UserModel的namespace是users
      payload: {
        page: users.meta.page,
        per_page: users.meta.per_page,
      },
    });
  };

  //定义分页的函数
  const paginationHandler = (page: number, pageSize?: number) => {
    dispatch({
      type: 'users/getRemote',
      payload: {
        page,
        per_page: pageSize ? pageSize : users.meta.per_page,
      },
    });
  };

  //定义每页有几条数据的函数
  const pageSizeHandler = (current: number, size: number) => {
    dispatch({
      type: 'users/getRemote',
      payload: {
        page: current,
        per_page: size,
      },
    });
  };

  return (
    <div className="list-table">
      <ProTable
        columns={columns}
        dataSource={users.data}
        rowKey="id"
        loading={userListLoading}
        search={false}//隐藏筛选栏
        pagination={false}//隐藏分页栏（antd protable的分页栏不太好用，所以还是重新从antd引入了分页栏，从protable和antd的官方文档看到，protable获取数据可以使用request，但是antd中的Pagination还是需要使用dataSource）
        options={{
          density: true,
          fullScreen: true,
          reload: () => {
            reloadHandler();
          },
          setting: true,
        }}
        headerTitle="用户列表"
        toolBarRender={() => [
          <Button type="primary" onClick={addHandler}>
            添加
          </Button>,
          <Button onClick={reloadHandler}>刷新</Button>,
        ]}
      />
      <Pagination
        className="list-page"
        total={users.meta.total}
        onChange={paginationHandler}
        onShowSizeChange={pageSizeHandler}
        current={users.meta.page}
        pageSize={users.meta.per_page}
        showSizeChanger
        showQuickJumper
        showTotal={total => `共有 ${total} 条记录`}
      />
      <UserModal
        visible={modalVisible}
        closeHandler={closeHandler}
        record={record}
        onFinish={onFinish}
        confirmLoading={confirmLoading}
      ></UserModal>
    </div>
  );
};

const mapStateToProps = ({
  users,
  loading,
}: {
  users: UserState;
  loading: Loading;
}) => {
  return {
    users,
    userListLoading: loading.models.users,
  };
};

export default connect(mapStateToProps)(UserListPage);
