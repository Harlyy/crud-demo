import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },

  //删除umi原有的约定式路由
  // routes: [
  //   { path: '/uers', component: '@/pages/index' },
  // ],
});
