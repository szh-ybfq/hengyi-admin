import request from '@/utils/request'

// 1  用户管理接口 
// 1.1 用户登录、退出、注册
export function login(data) {
  return request({
    url: '/admin/api/v1/user/login',
    method: 'post',
    data
  })
}
export function logout() {
  return request({
    url: '/admin/api/v1/user/logout',
    method: 'post'
  })
}
export function register() {//??????????????????还没使用
  return request({
    url: '/admin/api/v1/user/register',
    method: 'post'
  })
}
export function getUserPage(params) {
  return request({
    url: '/admin/api/v1/user/page',
    method: 'get',
    params
  })
}
export function getUserInfo(id) {
  return request({
    url: `/admin/api/v1/user/${id}`,
    method: 'get'
  })
}
export function addUser(data) {
  return request({
    url: '/admin/api/v1/user/add',
    method: 'post',
    data
  })
}
export function updateUser(data) {
  return request({
    url: '/admin/api/v1/user/edit',
    method: 'put',
    data
  })
}
export function delUser(id) {
  return request({
    url: `/admin/api/v1/user/${id}`,
    method: 'delete'
  })
}
// 根据用户id 查询该用户已分配的角色id集合
export function getRoleIdsByUserId(userId) {
  return request({
    url: `/admin/api/v1/user/roleIds/${userId}`,
    method: 'get'
  })
}
// 1.7 用户分配角色
export function assignRole(data) {
  return request({
    url: '/admin/api/v1/user/assignRole',
    method: 'post',
    data
  })
}

// 2 角色管理接口 
export function getRoleOption() {// 获取角色列表(下拉选项)
  return request({
    url: '/admin/api/v1/role/list',
    method: 'get'
  })
}
export function getRolePage(params) {
  return request({
    url: '/admin/api/v1/role/page',
    method: 'get',
    params
  })
}
export function getRoleInfo(id) {
  return request({
    url: `/admin/api/v1/role/${id}`,
    method: 'get'
  })
}
export function addRole(data) {
  return request({
    url: '/admin/api/v1/role/add',
    method: 'post',
    data
  })
}
export function updateRole(data) {
  return request({
    url: '/admin/api/v1/role/edit',
    method: 'put',
    data
  })
}
export function delRole(id) {
  return request({
    url: `/admin/api/v1/role/${id}`,
    method: 'delete'
  })
}
// 角色分配菜单权限
export function assignMenu(data) {
  return request({
    url: '/admin/api/v1/role/assignMenu',
    method: 'post',
    data
  })
}

// 获取某个角色已分配的菜单id列表（回显用）
export function getMenuIdsByRoleId(roleId) {
  return request({
    url: `/admin/api/v1/role/menuIds/${roleId}`,
    method: 'get'
  })
}

// 3 菜单管理接口 
    // 获取全部菜单
export function getMenuTree() {
  return request({
    url: '/admin/api/v1/menu/tree',
    method: 'get'
  })
}
    //  登录获取当前用户菜单（侧边栏动态路由核心） 
export function getLoginUserMenu() {
  return request({
    url: '/admin/api/v1/menu/user/tree',
    method: 'get'
  })
}

export function getMenuInfo(id) {
  return request({
    url: `/admin/api/v1/menu/${id}`,
    method: 'get'
  })
}
export function addMenu(data) {
  return request({
    url: '/admin/api/v1/menu/add',
    method: 'post',
    data
  })
}
export function updateMenu(data) {
  return request({
    url: '/admin/api/v1/menu/edit',
    method: 'put',
    data
  })
}
export function delMenu(id) {
  return request({
    url: `/admin/api/v1/menu/${id}`,
    method: 'delete'
  })
}

