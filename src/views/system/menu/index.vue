<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="mb15">
        <el-button type="primary" @click="openDialog()">新增菜单</el-button>
      </div>

      <!-- 树形表格 row-key必须为id -->
      <el-table
        :data="tableData"
        border
        stripe
        row-key="id"
        default-expand-all
      >
        <el-table-column prop="menuName" label="菜单名称"/>
        <el-table-column prop="path" label="路由路径"/>
        <el-table-column prop="component" label="组件"/>
        <el-table-column prop="menuType" label="类型">
          <template #default="{row}">
            <span v-if="row.menuType==='M'">目录</span>
            <span v-if="row.menuType==='C'">菜单</span>
            <span v-if="row.menuType==='F'">按钮</span>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标"/>
        <el-table-column prop="sort" label="排序"/>
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status===0?'success':'danger'">
              {{ row.status===0?"正常":"禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="success" @click="openAddChild(row)">新增子菜单</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px">
      <el-form
        :rules="rules"
        ref="menuFormRef"
        :model="form"
        label-width="110px"
      >
        <el-form-item label="上级菜单" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择上级菜单"
            style="width:100%"
            :disabled="isAddChildMode"
          >
            <el-option label="根目录" :value="0"/>
            <!--递归渲染下拉选项，子菜单前面加空格缩进模拟树形效果 -->
            <template v-for="item in flatMenuOptions" :key="item.id">
              <el-option :label="item.label" :value="item.id"/>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName"></el-input>
        </el-form-item>
        <el-form-item label="路由path" prop="path">
          <el-input v-model="form.path"></el-input>
        </el-form-item>
        <el-form-item label="组件component" prop="component">
          <el-input v-model="form.component"></el-input>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="M">目录</el-radio>
            <el-radio label="C">菜单</el-radio>
            <el-radio label="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuTree, getMenuInfo, addMenu, updateMenu, delMenu } from '@/api/system'

const menuFormRef = ref(null)
const tableData = ref([])
const dialogVisible = ref(false)
// 弹窗标题
const dialogTitle = ref('新增菜单')
// 是否【新增子菜单】模式，用来控制上级菜单select禁用
const isAddChildMode = ref(false)

// 给普通el‑select用的扁平化数组
const flatMenuOptions = ref([])

const form = reactive({
  id: null,
  parentId: 0,
  menuName: "",
  path: "",
  component: "",
  menuType: "M",
  icon: "",
  sort: 1,
  status: 0
})

const rules = {
  menuName: [
    { required: true, message: '菜单名称不能为空', trigger: ['blur','change'] },
    { min:1, max:50, message:'1‑50字符', trigger: ['blur','change'] }
  ],
  menuType: [
    { required: true, message: '请选择菜单类型', trigger: ['change'] }
  ],
  sort: [
    { required: true, message: '排序不能为空', trigger: ['blur'] }
  ]
}

/**
 * 树转扁平化，子节点前面加空格模拟层级缩进
 */
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

async function getList() {
  const res = await getMenuTree()
  console.log("菜单树返回", res)
  tableData.value = res.data
  // 转为扁平下拉数组
  flatMenuOptions.value = treeToFlat(res.data,0)
}

async function openDialog(row) {
  dialogVisible.value = true
  isAddChildMode.value = false
  dialogTitle.value = "新增菜单"

  if (row) {
    // 编辑模式
    dialogTitle.value = "编辑菜单"
    const res = await getMenuInfo(row.id)
    Object.assign(form, res.data)
  } else {
    // 新增根菜单
    form.id = null
    form.parentId = 0
    form.menuName = ""
    form.path = ""
    form.component = ""
    form.menuType = "M"
    form.icon = ""
    form.sort = 1
    form.status = 0
  }
  nextTick(() => {
    menuFormRef.value?.clearValidate()
  })
}

/** 新增子菜单 */
function openAddChild(row) {
  dialogVisible.value = true
  // 标记子菜单模式：禁用上级选择框
  isAddChildMode.value = true
  dialogTitle.value = "新增子菜单"

  form.id = null
  form.parentId = row.id
  form.menuName = ""
  form.path = ""
  form.component = ""
  form.menuType = "C"
  form.icon = ""
  form.sort = 1
  form.status = 0

  nextTick(() => {
    menuFormRef.value?.clearValidate()
  })
}

async function submitForm() {
  await nextTick()
  if (!menuFormRef.value) {
    console.warn("表单ref获取失败")
    return
  }
  try {
    await menuFormRef.value.validate()
    let res
    if (form.id) {
      res = await updateMenu(form)
    } else {
      res = await addMenu(form)
    }
    if (res.code !== 200) {
      ElMessage.error(res.msg || "操作失败")
      return
    }
    ElMessage.success("操作成功")
    dialogVisible.value = false
    await getList()
  } catch (err) {
    console.log("表单校验失败", err)
  }
}

async function handleDelete(row) {
  ElMessageBox.confirm('确定删除该菜单？会递归删除子菜单！','提示',{type:'warning'})
  .then(async ()=>{
    await delMenu(row.id)
    ElMessage.success("删除成功")
    await getList()
  })
}

onMounted(()=>{
  getList()
})
</script>

<style scoped>
.page-container{padding:10px;}
.mb15{margin-bottom:15px;}
</style>