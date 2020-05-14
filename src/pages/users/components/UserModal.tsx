import React, { useEffect, FC } from 'react';
import { Modal, Button, Form, Input, message, DatePicker, Switch } from 'antd';
import { SingleUserType, FormValues } from '../data.d';
import moment from 'moment';

interface UserModalProps {
  visible: boolean;
  record: SingleUserType | undefined;
  closeHandler: () => void;
  onFinish: (values: FormValues) => void;
  confirmLoading: boolean;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const UserModal: FC<UserModalProps> = props => {
  const [form] = Form.useForm();

  //在props中找到visible, record等值，后面就不用再写props.xxx，直接写xxx就可以了
  const { visible, record, closeHandler, onFinish, confirmLoading } = props;

  //网上说使用userEffect处理了生命周期的问题，但是我这里没有搞懂，只是参考网上的一些示例代码写出来的
  useEffect(() => {
    if (record === undefined) {
      form.resetFields();
    } else {
      form.setFieldsValue({
        ...record,
        create_time: moment(record.create_time),
        status: Boolean(record.status),
      });
    }
  }, [visible]);

  //定义点击ok的函数
  const onOk = () => {
    form.submit();
  };

  //定义点击ok后提交失败的函数（因为提交失败的时候，事件依旧是在UserModal窗口中发生的，所以onFinishFailed写在这里，但是当提交成功时，会引起主页面列表中数据的变化，所以onFinish就写在主页面里边）
  const onFinishFailed = (errorInfo: any) => {
    message.error(errorInfo.errorFields[0].errors[0]);
  };

  return (
    <div>
      <Modal
        title={record ? 'Edit ID: ' + record.id : 'Add'}
        visible={visible}
        onOk={onOk}
        onCancel={closeHandler}
        confirmLoading={confirmLoading}
        forceRender
      >
        <Form
          {...layout}
          name="basic"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            status: true,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Create Time" name="create_time">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item label="Status" name="status" valuePropName="checked">
            Are you a leader?&nbsp;&nbsp;&nbsp;<Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserModal;
