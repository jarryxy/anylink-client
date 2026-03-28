import type { RouteRecordRaw } from "vue-router";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首页",
    component: () => import("@renderer/views/anylink_client_agent.vue"),
  },
];

export default routes;
