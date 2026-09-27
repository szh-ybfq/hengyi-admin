<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="mb15">
        <el-button type="primary" @click="openDialog()">新增分类</el-button>
      </div>

      <!-- 树形表格 row-key必须为id -->
      <el-table
        :data="tableData"
        border
        stripe
        row-key="id"
        default-expand-all
      >
        <el-table-column prop="categoryName" label="分类名称"/>
        <el-table-column prop="sort" label="排序"/>
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status===0?'success':'danger'">
              {{ row.status===0?"启用":"禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="success" @click="openAddChild(row)">新增子分类</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px">
      <el-form
        :rules="rules"
        ref="categoryFormRef"
        :model="form"
        label-width="110px"
      >
        <el-form-item label="上级分类" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择上级分类"
            style="width:100%"
            :disabled="isAddChildMode"
          >
            <el-option label="根分类" :value="0"/>
            <template v-for="item in flatOptions" :key="item.id">
              <el-option :label="item.label" :value="item.id"/>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName"></el-input>
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
import { getCategoryTree, addCategory, updateCategory, delCategory } from '@/api/system'

const categoryFormRef = ref(null)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const isAddChildMode = ref(false)
const flatOptions = ref([])

const form = reactive({
  id: null,
  parentId: 0,
  categoryName: "",
  sort: 1,
  status: 0
})

const rules = {
  categoryName: [
    { required: true, message: '分类名称不能为空', trigger: ['blur','change'] },
    { min:1, max:50, message:'1‑50字符', trigger: ['blur','change'] }
  ],
  sort: [
    { required: true, message: '排序不能为空', trigger: ['blur'] }
  ]
}

/**树转扁平，空格缩进模拟层级 */
function treeToFlat(list, level = 0) {
  const res = []
  for(const node of list){
    res.push({
      id: node.id,
      label: "　".repeat(level) + node.categoryName
    })
    if(node.children && node.children.length>0){
      res.push(...treeToFlat(node.children, level+1))
    }
  }
  return res
}

async function getList() {
  const res = await getCategoryTree()
  tableData.value = res.data
  flatOptions.value = treeToFlat(res.data,0)
}

async function openDialog(row) {
  dialogVisible.value = true
  isAddChildMode.value = false
  dialogTitle.value = "新增分类"

  if (row) {
    dialogTitle.value = "编辑分类"
    Object.assign(form, row)
  } else {
    form.id = null
    form.parentId = 0
    form.categoryName = ""
    form.sort = 1
    form.status = 0
  }
  nextTick(() => {
    categoryFormRef.value?.clearValidate()
  })
}

/**新增子分类 */
function openAddChild(row) {
  dialogVisible.value = true
  isAddChildMode.value = true
  dialogTitle.value = "新增子分类"

  form.id = null
  form.parentId = row.id
  form.categoryName = ""
  form.sort = 1
  form.status = 0

  nextTick(() => {
    categoryFormRef.value?.clearValidate()
  })
}

async function submitForm() {
  await nextTick()
  if (!categoryFormRef.value) return
  try {
    await categoryFormRef.value.validate()
    let res
    if (form.id) {
      res = await updateCategory(form)
    } else {
      res = await addCategory(form)
    }
    if (res.code !== 200) {
      ElMessage.error(res.msg || "操作失败")
      return
    }
    ElMessage.success("操作成功")
    dialogVisible.value = false
    await getList()
  } catch (err) {
    // 捕获后端抛出的业务异常，展示后端msg
    if (err?.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error("操作失败，请稍后重试")
    }
    console.error('提交异常：', err)
  }
}

async function handleDelete(row) {
  ElMessageBox.confirm('确定删除该分类？将校验其子分类与商品引用','提示',{type:'warning'})
  .then(async ()=>{
    try {
      await delCategory(row.id)
      ElMessage.success("删除成功")
      await getList()
    } catch (err) {
      console.error('错误详情：', err)
      // 读取后端返回的业务提示
      const tip = err?.response?.data?.msg || "删除失败"
      ElMessage.error(tip)
    }
  })
  .catch(() => {})
}

onMounted(()=>{
  getList()
})
</script>

<style scoped>
.page-container{padding:10px;}
.mb15{margin-bottom:15px;}
</style>