import { Reducer, Effect, Subscription } from 'umi';
import { getRemoteList, editRecord, deleteRecord, addRecord } from './service';
import { message } from 'antd';
import { SingleUserType } from './data.d';

export interface UserState {
  data: SingleUserType[];
  meta: {
    total: number;
    per_page: number;
    page: number;
  };
}

interface UserModelType {
  namespace: 'users';
  state: UserState;
  reducers: {
    getList: Reducer<UserState>;
  };
  effects: {
    getRemote: Effect;
    delete: Effect;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const UserModel: UserModelType = {
  namespace: 'users',
  state: {
    data: [],
    meta: {
      total: 0,
      per_page: 10,
      page: 1,
    },
  },
  reducers: {
    getList(state, { payload }) {
      //此处本应是getList(state, action)。action是个对象，其中包含{type, payload}两个属性，此处{ payload }是更直观、更精确的写法，但是记得一定要加{}
      return payload;
    },
  },
  effects: {

    //一定记得，effects中都是异步函数，要记得加*和yield
    *getRemote({ payload: { page, per_page } }, { put, call }) {
      const data = yield call(getRemoteList, { page, per_page });
      if (data) {
        yield put({
          type: 'getList',
          payload: data,
        });
      }
    },


    *delete({ payload: { id } }, { put, call, select }) {
      const data = yield call(deleteRecord, { id });
      //如果删除成功，则提示删除成功，并且重新刷新列表；如果删除失败，则提示删除失败
      if (data) {
        message.success('Delete successfully.');
        const { page, per_page } = yield select(
          (state: any) => state.users.meta,
        );
        //重新调用一下*getRemote，刷新列表
        yield put({
          type: 'getRemote',
          payload: {
            page,
            per_page,
          },
        });
      } else {
        message.error('Delete failed.');
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/users') {
          //一定要记得这里的pathname是/users，因为页面放在了src/pages/users下
          dispatch({
            type: 'getRemote',
            payload: {
              page: 1,
              per_page: 10,
            },
          });
        }
      });
    },
  },
};

export default UserModel;
