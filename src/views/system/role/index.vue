<template>
  <div class="page-container">
    <el-card shadow="never">
      <el-row :gutter="10" class="mb15">
        <el-col :span="18">
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable style="width:240px"></el-input>
          <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width:140px;margin-left:8px">
            <el-option label="正常" :value="0"/>
            <el-option label="禁用" :value="1"/>
          </el-select>
          <el-button type="primary" @click="getList" style="margin-left:8px">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="6" style="text-align:right">
          <el-button type="primary" @click="openDialog()">新增角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="roleName" label="角色名称"/>
        <el-table-column prop="roleKey" label="角色编码"/>
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status ===0 ? 'success' : 'danger'">
              {{ row.status===0 ? "正常":"禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"/>
        <el-table-column label="操作" width="260">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openAssignMenu(row)">分配菜单</el-button>
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
    <el-dialog v-model="dialogVisible" title="角色表单" width="550px">
      <el-form :rules="rules" ref="roleFormRef"  :model="form" label-width="100px" >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleKey">
          <el-input v-model="form.roleKey"></el-input>
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

    <!-- 分配菜单弹窗 -->
    <el-dialog v-model="assignMenuDialogVisible" title="分配菜单" width="620px">
      <p>角色：{{ currentRow?.roleName }}</p>
      <el-form label-width="80px">
        <el-form-item label="分配菜单">
          <el-select
            v-model="assignMenuIdList"
            multiple
            placeholder="请分配菜单权限"
            style="width:100%"
            v-if="assignFlatMenuOptions?.length > 0"
          >
            <el-option
              v-for="item in assignFlatMenuOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
          <span v-else>菜单加载中...</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignMenuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignMenu">保存分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRolePage,addRole,updateRole,delRole,getRoleInfo, getMenuTree,getMenuIdsByRoleId,assignMenu } from '@/api/system'

const roleFormRef = ref(null)

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const assignMenuDialogVisible = ref(false)

const currentRow = ref(null)
const assignFlatMenuOptions = ref([])
const assignMenuIdList = ref([])

/** 树转扁平，空格缩进模拟层级 */
function treeToFlat(list, level = 0) {
  const res = []
  for(const node of list){
    res.push({
      id: node.id,
      label: "　".repeat(level) + node.menuName
    })
    if(node.children && node.children.length>0){
      res.push(...treeToFlat(node.children, level+1))
    }
  }
  return res
}

const queryParams = reactive({
  pageNum:1,
  pageSize:10,
  roleName:"",
  status:null
})

const form = reactive({
  id:null,
  roleName:"",
  roleKey:"",
  status:0,
})

const rules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: ['blur','change'] },
  ],
  roleKey: [
    { required: true, message: '角色编码不能为空', trigger: ['blur','change'] },
  ]
}

async function getList(){
  const res = await getRolePage(queryParams)
  console.log("角色分页返回",res)
  tableData.value = res.data.records
  total.value = res.data.total
}

function resetQuery(){
  queryParams.roleName=""
  queryParams.status=null
  queryParams.pageNum=1
  getList()
}

async function openDialog(row){
  dialogVisible.value=true

  if(row){
    const res = await getRoleInfo(row.id)
    Object.assign(form, res.data)
  }else{
    form.id=null
    form.roleName=""
    form.roleKey=""
    form.status=0
  }
  nextTick(()=>{
    roleFormRef.value?.clearValidate()
  })
}

async function submitForm(){
  await nextTick()
  if(!roleFormRef.value){
    console.warn("表单ref获取失败")
    return
  }
  try {
    await roleFormRef.value.validate()
    let res
    if(form.id){
      res = await updateRole(form)
    }else{
      res = await addRole(form)
    }
    if(res.code !== 200){
      ElMessage.error(res.msg || "操作失败")
      return
    }
    ElMessage.success("操作成功")
    dialogVisible.value=false
    await getList()
  } catch (err) {
    console.log("表单校验失败", err)
  }
}

async function handleDelete(row){
  ElMessageBox.confirm('确定删除该角色？','提示',{type:'warning'})
  .then(async ()=>{
    await delRole(row.id)
    ElMessage.success("删除成功")
    await getList()
  })
}

// 打开分配菜单弹窗
async function openAssignMenu(row){
  currentRow.value = row
  assignMenuDialogVisible.value = true
  assignMenuIdList.value = []

  const treeRes = await getMenuTree()
  assignFlatMenuOptions.value = treeToFlat(treeRes.data, 0)

  const assignRes = await getMenuIdsByRoleId(row.id)
  assignMenuIdList.value = assignRes.data
}

// 提交分配菜单
async function submitAssignMenu(){
  try{
    await assignMenu({
      roleId: currentRow.value.id,
      menuIdList: assignMenuIdList.value
    })
    ElMessage.success("分配成功")
    assignMenuDialogVisible.value = false
    await getList()
  }catch(e){
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