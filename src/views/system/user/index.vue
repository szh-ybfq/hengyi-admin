<template>
  <div class="page-container">
    <el-card shadow="never">
      <el-row :gutter="10" class="mb15">
        <el-col :span="18">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable style="width:200px"></el-input>
          <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable style="width:200px;margin-left:8px"></el-input>
          <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width:140px;margin-left:8px">
            <el-option label="正常" :value="0"/>
            <el-option label="禁用" :value="1"/>
          </el-select>
          <el-button type="primary" @click="getList" style="margin-left:8px">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="6" style="text-align:right">
          <el-button type="primary" @click="openDialog()">新增用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="username" label="用户名"/>
        <el-table-column prop="nickname" label="昵称"/>
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status ===0 ? 'success' : 'danger'">
              {{ row.status===0 ? "正常":"禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"/>
        <el-table-column label="操作" width="240">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openAssignRole(row)">分配角色</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @change="getList"
        class="mt15"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户表单" width="600px">
      <el-form :rules="rules" ref="userFormRef"  :model="form" label-width="100px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <!-- 新增才显示密码，编辑不回显密码 -->
        <el-form-item v-if="!form.id" label="密码" prop="password">
          <el-input v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 预留 -->
        <!-- 分配角色弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="分配角色" width="520px">
      <p>用户：{{currentRow?.username}}</p>
      <el-form label-width="80px">
        <el-form-item label="选择角色">
          <!-- 多选下拉，value存id，页面展示角色名称 -->
          <el-select
            v-model="assignRoleIdList"
            multiple
            placeholder="请分配角色"
            style="width:100%"
            v-if="allRoleOptions.length>0"
          >
            <el-option
              v-for="item in allRoleOptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
          <!-- 加载中占位 -->
          <span v-else>加载角色选项...</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitAssignRole">保存分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage,addUser,updateUser,delUser,assignRole,getUserInfo, getRoleOption,getRoleIdsByUserId } from '@/api/system'

const userFormRef = ref(null)

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)



// ----分配角色相关变量
const assignDialogVisible = ref(false)
const currentRow = ref(null)
// 下拉全部角色选项
const allRoleOptions = ref([])
// 绑定多选框，存选中的角色id数组，用来回显+提交
const assignRoleIdList = ref([])

const queryParams = reactive({
  pageNum:1,
  pageSize:10,
  username:"",
  nickname:"",
  status:null
})

const form = reactive({
  id:null,
  username:"",
  nickname:"",
  password:"",
  status:0,
})
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: ['blur','change'] },
    { min: 6, max: 60, message: '用户名6‑60位', trigger: ['blur','change'] }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: ['blur','change'] },
    { min: 6, max: 60, message: '密码6‑60位', trigger: ['blur','change'] }
  ],
  nickname: [
    { required: true, message: '昵称不能为空', trigger: ['blur','change'] },
    { min:1, max:50, message:'昵称1‑50位', trigger: ['blur','change']}
  ]
}

async function getList(){
  const res = await getUserPage(queryParams)
  console.log("分页返回",res)
  tableData.value = res.data.records
  total.value = res.data.total
}

function resetQuery(){
  queryParams.username=""
  queryParams.nickname=""
  queryParams.status=null
  queryParams.pageNum=1
  getList()
}

async function openDialog(row){
  dialogVisible.value=true
  nextTick(()=>{
    userFormRef.value?.clearValidate()//清除表单之前的红色校验提示
  })

  if(row){
    // 编辑：调用后端接口，根据id查最新详情，不要直接用表格row
    const res = await getUserInfo(row.id)
    Object.assign(form, res.data)
    form.password = "" // 编辑密码清空，不回显
  }else{
    // 新增
    form.id=null
    form.username=""
    form.nickname=""
    form.password=""
    form.status=0
  }
}


async function submitForm(){
  // 等待dom更新
  await nextTick()
  // 如果拿不到表单实例直接返回
  if(!userFormRef.value){
    console.warn("表单ref获取失败")
    return
  }
  try {
    // 前端校验
    await userFormRef.value.validate()
    // 校验通过才发请求
    let res
    if(form.id){
      res = await updateUser(form)
    }else{
      res = await addUser(form)
    }
    console.log("后端返回完整res", res)
    if(res.code !== 200){
      ElMessage.error(res.msg || "操作失败")
      return
    }
    ElMessage.success("操作成功")
    dialogVisible.value=false
    await getList()
  } catch (err) {
    console.log("前端校验失败", err)
  }
}

async function handleDelete(row){
  ElMessageBox.confirm('确定删除该用户？','提示',{type:'warning'})
  .then(async ()=>{
    await delUser(row.id)
    ElMessage.success("删除成功")
    await getList()
  })
}

// 打开分配角色弹窗
// 打开分配角色弹窗
async function openAssignRole(row){
  currentRow.value = row
  assignDialogVisible.value = true
  assignRoleIdList.value = []

  // 加载全部角色下拉选项
  const roleRes = await getRoleOption()
  allRoleOptions.value = roleRes.data

  // 查询该用户已经分配的角色ID，做回显
  const assignRes = await getRoleIdsByUserId(row.id)
  assignRoleIdList.value = assignRes.data
}
// 提交分配角色
async function submitAssignRole(){
  try {
    await assignRole({
      userId: currentRow.value.id,
      roleIdList: assignRoleIdList.value
    })
    ElMessage.success("分配成功")
    assignDialogVisible.value = false
    await getList()
  }catch (e){
    console.error(e)
  }
}

onMounted(()=>{
  getList()
})
</script>
<style scoped>
.page-container{padding:10px;}
.mb15{margin-bottom:15px;}
.mt15{margin-top:15px;}
</style>