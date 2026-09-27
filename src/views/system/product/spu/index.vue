<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 查询区 -->
      <el-form :model="queryForm" inline class="mb15">
        <el-form-item label="商品名称">
          <el-input
            v-model="queryForm.spuName"
            placeholder="请输入商品名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态">
            <el-option label="全部" value="null" />
            <el-option label="上架" value="1" />
            <el-option label="下架" value="0" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="getList">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="success" @click="openDialog()">新增商品</el-button>
      </el-form>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="spuName" label="商品名称" />
        <el-table-column prop="price" label="参考售价" />
        <el-table-column prop="saleCount" label="销量" />
        <el-table-column prop="status" label="上下架">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)"
              >编辑</el-button
            >
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </el-card>
    <!-- 新增编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="950px">
      <el-form
        :rules="rules"
        ref="spuFormRef"
        :model="form"
        label-width="110px"
      >
        <el-form-item label="商品分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="选择分类"
            style="width: 100%"
          >
            <!-- 层级缩进分类列表，只有叶子节点可用 -->
            <template v-for="item in flatCategoryOptions" :key="item.id">
              <el-option :label="item.label" :value="item.id" :disabled="!item.isLeaf" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="spuName">
          <el-input v-model="form.spuName"></el-input>
        </el-form-item>
        <el-form-item label="参考售价" prop="price">
          <el-input v-model="form.price"></el-input>
        </el-form-item>
        <!--商品主图-->
        <el-form-item label="* 商品主图">
          <div class="img-scroll-wrap">
            <div
              class="img-item-wrap"
              v-for="(url, idx) in form.mainImgList"
              :key="idx"
            >
              <el-image :src="url" fit="cover" class="img-item"></el-image>
              <div class="img-del-btn" @click="onMainImgRemove(idx)">×</div>
            </div>
            <!-- 主图：数组为空才显示上传按钮，最多一张 -->
            <el-upload
              v-if="form.mainImgList.length === 0"
              action=""
              :show-file-list="false"
              :http-request="(opt) => customUpload(opt, 'GOODS_MAIN')"
            >
              <div class="img-add-btn">+</div>
            </el-upload>
          </div>
        </el-form-item>
        <!--商品详情图-->
        <el-form-item label="* 商品详情图">
          <div class="img-scroll-wrap">
            <el-upload
              v-model:file-list="detailFileList"
              action=""
              :auto-upload="false"
              :auto-remove-file-list="false"
              multiple
              list-type="picture-card"
              accept="image/*"
            >
              <template #file="{ file, index }">
                <div
                  class="picture-card-item"
                  style="position: relative; "
                >
                  <img
                    :src="file.url"
                    style="object-fit:object-cover; width: 100%; height: 100%"
                  />
                  <!-- 上传成功标记 绿色对勾 -->
                  <div v-if="file.bizUrl" class="upload-ok-mark">✓</div>
                  <!--放大预览按钮-->
                  <div
                    @click.stop="openImagePreview(detailFileList, file)"
                    style="
                      position: absolute;
                      left: 2px;
                      top: 2px;
                      cursor: pointer;
                      background: #0008;
                      color: white;
                      padding: 0 3px;
                      font-size: 12px;
                    "
                  >
                    🔍
                  </div>
                  <!--删除按钮-->
                  <div
                    @click.stop="handleDetailDelete(file)"
                    style="
                      position: absolute;
                      right:2px;
                      top: 2px;
                      cursor: pointer;
                      background: #0008;
                      color: white;
                      padding: 0 4px;
                    "
                  >
                    ×
                  </div>
                </div>
              </template>
              <el-icon>+</el-icon>
            </el-upload>
            <el-button type="primary" @click="doBatchUpload('GOODS_DETAILS')"
              :disabled="!hasDetailNewFile"
              >确认批量上传</el-button
            >
          </div>
        </el-form-item>
        <!--商品参数图-->
        <el-form-item label="* 商品参数图">
          <div class="img-scroll-wrap">
            <el-upload
              v-model:file-list="paramFileList"
              action=""
              :auto-upload="false"
              multiple
              list-type="picture-card"
              accept="image/*"
            >
              <template #file="{ file, index }">
                <div
                  class="picture-card-item"
                  style="position: relative"
                >
                  <img
                    :src="file.url"
                    style="width: 100%; height: 100%; object-fit: cover"
                  />
                  <!-- 上传成功标记 绿色对勾 -->
                  <div v-if="file.bizUrl" class="upload-ok-mark">✓</div>
                  <!--放大预览按钮-->
                  <div
                    @click.stop="openImagePreview(paramFileList, file)"
                    style="
                      position: absolute;
                      left: 2px;
                      top: 2px;
                      cursor: pointer;
                      background: #0008;
                      color: white;
                      padding: 0 3px;
                      font-size: 12px;
                    "
                  >
                    🔍
                  </div>
                  <!--删除按钮-->
                  <div
                    @click.stop="handleParamDelete(file)"
                    style="
                      position: absolute;
                      right: 2px;
                      top: 2px;
                      cursor: pointer;
                      background: #0008;
                      color: white;
                      padding: 0 4px;
                    "
                  >
                    ×
                  </div>
                </div>
              </template>
              <el-icon>+</el-icon>
            </el-upload>
            <el-button type="primary" @click="doBatchUpload('GOODS_PARAMS')"
              :disabled="!hasParamNewFile"
              >确认批量上传</el-button
            >
          </div>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.spuDescription" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="上下架状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">下架</el-radio>
            <el-radio :label="1">上架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="SKU规格列表">
          <el-button size="small" @click="addSkuRow">新增SKU</el-button>
          <el-table :data="form.skuList" border stripe class="mt10" style="width:100%">
            <!--SKU图片列-->
            <el-table-column label="规格图片" width="140">
              <template #default="{row,$index}">
                <div class="sku-img-cell">
                  <div v-if="row.skuImgUrl" class="sku-img-wrap">
                    <el-image :src="row.skuImgUrl" fit="cover" class="sku-img"></el-image>
                    <div class="sku-img-del" @click="removeSkuImg($index)">×</div>
                  </div>
                  <el-upload v-else action="" :show-file-list="false"
                    :http-request="(opt)=>skuCustomUpload(opt,$index)"
                  >
                    <div class="sku-add-btn">+</div>
                  </el-upload>
                </div>
              </template>
            </el-table-column>
            <!--规格键值对编辑器-->
            <el-table-column label="规格组合" min-width="260">
              <template #default="{row}">
                <div class="sku-spec-editor">
                  <div v-for="(item,idx) in row.specPairList" :key="idx" class="pair-row">
                    <el-input v-model="item.key" placeholder="规格名称(颜色/尺寸等)" size="small"
                      @blur="checkPairItem(item)"
                    ></el-input>
                    <span class="sep">:</span>
                    <el-input v-model="item.value" placeholder="规格值(蓝色/M等)" size="small"
                      @blur="checkPairItem(item)"
                    ></el-input>
                    <el-button class="cuo" size="small" icon="Delete" @click="removePair(row,idx)" ><el-icon><Delete /></el-icon></el-button>
                  </div>
                  <el-button size="small" @click="addSpecPair(row)" style="margin-top:6px">+增加一行规格</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="SKU售价" width="120">
              <template #default="{ row }">
                <el-input v-model="row.price" size="small"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="可用库存" width="120">
              <template #default="{ row }">
                <el-input v-model="row.stock" size="small"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row, $index }">
                <el-button
                  size="small"
                  type="danger"
                  @click="form.skuList.splice($index, 1)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <!--图片预览弹窗-->
      <el-image-viewer
        v-if="previewVisible"
        :url-list="previewImgList"
        :initial-index="previewIndex"
        @close="previewVisible = false"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick , computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete } from '@element-plus/icons-vue'
// 替换接口：使用分类树接口，移除getCategoryOption
import {
  getSpuPage,
  getSpuInfo,
  addSpu,
  updateSpu,
  delSpu,
  getCategoryTree,
  uploadImage,
  uploadImages,
  deleteImage,
} from "@/api/system";
const spuFormRef = ref(null);
const tableData = ref([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref("新增商品");
// 替换原categoryOptions，命名为层级扁平分类
const flatCategoryOptions = ref([]);
const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  spuName: "",
  status: null,
});
// 商品详情图、商品参数图，前端预览用
const detailFileList = ref([]);
const paramFileList = ref([]);
//图片预览
const previewVisible = ref(false);
const previewImgList = ref([]);
const previewIndex = ref(0);
//sku每一行里面键值对对象
function createEmptyPair(){
  return {key:"",value:""}
}
//新建一行SKU
function createEmptySkuRow(){
  return {
    skuImgUrl:"",
    skuSpec:"", //提交后端json字符串
    specPairList:[createEmptyPair()], //前端临时，键值对数组
    price: "",
    stock: 0,
  }
}
// 表单数据
const form = reactive({
  id: null,
  categoryId: null,
  spuName: "",
  spuDescription: "",
  price: "",
  status: 0,
  skuList: [],
  mainImgList: [],
  detailImgList: [], //详情图url数组，提交给后端用
  paramImgList: [], //参数图url数组，提交给后端用
});
// 表单校验
const rules = {
  categoryId: [
    { required: true, message: "请选择商品分类", trigger: "change" },
  ],
  spuName: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
  price: [{ required: true, message: "参考售价不能为空", trigger: "blur" }],
};
/** 复用分类管理页的树转扁平工具函数：空格缩进模拟层级 */
function treeToFlat(list, level = 0) {
  const res = [];
  for (const node of list) {
    // 判断叶子节点：没有children或者children为空数组
    const isLeaf = !node.children || node.children.length === 0;
    res.push({
      id: node.id,
      label: "　".repeat(level) + node.categoryName,
      isLeaf: isLeaf
    });
    if (node.children && node.children.length > 0) {
      res.push(...treeToFlat(node.children, level + 1));
    }
  }
  return res;
}
/** 加载带层级缩进的分类下拉选项（替代旧loadCategoryOption） */
async function loadTreeCategoryOption() {
  const res = await getCategoryTree();
  flatCategoryOptions.value = treeToFlat(res.data, 0);
}
/** 商品分页列表 */
async function getList() {
  const res = await getSpuPage(queryForm);
  tableData.value = res.data.records;
  total.value = res.data.total;
}
/** 重置查询条件 */
function resetQuery() {
  queryForm.spuName = "";
  queryForm.status = null;
  queryForm.pageNum = 1;
  getList();
}
/** 新增SKU行 */
function addSkuRow() {
  form.skuList.push(createEmptySkuRow());
}
//sku增加一组键值对
function addSpecPair(skuRow){
  skuRow.specPairList.push(createEmptyPair())
}
//删除一组键值对
function removePair(skuRow,idx){
  skuRow.specPairList.splice(idx,1);
  if(skuRow.specPairList.length ===0){
    skuRow.specPairList.push(createEmptyPair())
  }
}
//单行键值对校验：key不为空则value必填
function checkPairItem(pair){
  if(pair.key.trim() && !pair.value.trim()){
    ElMessage.warning("规格名称已填写，请填写规格值");
  }
}
//把specPairList转为skuSpec json字符串；过滤空key
function pairListToJson(pairList){
  const obj = {};
  for(let p of pairList){
    const k = p.key.trim();
    const v = p.value.trim();
    if(k){
      obj[k]=v;
    }
  }
  return JSON.stringify(obj);
}
//json字符串还原成pairList，编辑回显使用
function jsonToPairList(jsonStr){
  const arr = [];
  try{
    const obj = JSON.parse(jsonStr);
    for(let k of Object.keys(obj)){
      arr.push({key:k,value:obj[k]})
    }
  }catch(e){
  }
  if(arr.length===0){
    arr.push(createEmptyPair())
  }
  return arr;
}
/*打开新增/编辑弹窗 */
async function openDialog(row) {
  dialogVisible.value = true;
  // 每次打开弹窗加载层级分类树
  await loadTreeCategoryOption();
  // 先清空预览file列表，不要操作form！form要区分新增/编辑
  detailFileList.value = [];
  paramFileList.value = [];
  if (row) {
    dialogTitle.value = "编辑商品";
    try {
      // 查询商品详情以及图片
      const res = await getSpuInfo(row.id);
      Object.assign(form, res.data);
      // 防空校验：防止后端返回null（assign完立刻做数组兜底）
      form.skuList = form.skuList || [];
      form.mainImgList = form.mainImgList || [];
      form.detailImgList = form.detailImgList || [];
      form.paramImgList = form.paramImgList || [];
      //回显SKU：把skuSpec json转前端specPairList
      form.skuList.forEach(sku=>{
        sku.specPairList = jsonToPairList(sku.skuSpec)
      })
      // 详情图回显
      detailFileList.value = form.detailImgList.map(url => {
        return {
          uid: Math.random().toString(36).slice(2),
          url: url,
          bizUrl: url //自定义业务oss地址，预览删除用这个字段
        }
      })
      // 参数图回显
      paramFileList.value = form.paramImgList.map(url => {
        return {
          uid: Math.random().toString(36).slice(2),
          url: url,
          bizUrl: url
        }
      })

    } catch (err) {
      const tip = err?.response?.data?.msg || "获取商品详情失败";
      ElMessage.error(tip);
      dialogVisible.value = false;
      return;
    }
  } else {
    dialogTitle.value = "新增商品";
    form.id = null;
    form.categoryId = null;
    form.spuName = "";
    form.spuDescription = "";
    form.price = "";
    form.status = 0;
    form.mainImgList = [];
    form.detailImgList = [];
    form.paramImgList = [];
    form.skuList = [];
  }
  // 清除表单校验提示
  nextTick(() => spuFormRef.value?.clearValidate());
}
/*SKU行图片上传，GOODS_SKUS，逻辑类似商品主图*/
async function skuCustomUpload(options,skuIndex){
  const file = options.file;
  const formData = new FormData();
  if(form.id != null){
    formData.append("spuId", form.id);
  }
  formData.append("file", file);
  formData.append("fileType", "GOODS_SKUS");
  try {
    const res = await uploadImage(formData);
    if (res.code === 200) {
      const imgUrl = res.data;
      form.skuList[skuIndex].skuImgUrl = imgUrl;
      ElMessage.success("SKU规格图片上传成功");
      options.onSuccess(imgUrl);
    } else {
      ElMessage.error(res.msg || "上传失败");
      options.onError(new Error(res.msg));
    }
  } catch (e) {
    ElMessage.error("SKU图片上传异常");
    console.error(e);
    options.onError(e);
  }
}
//删除sku规格图片
async function removeSkuImg(skuIndex){
  const url = form.skuList[skuIndex].skuImgUrl;
  await deleteImage(url);
  form.skuList[skuIndex].skuImgUrl = "";
  ElMessage.success("删除成功");
}
/*上传单个图片*/
async function customUpload(options, fileType) {
  const file = options.file;
  const formData = new FormData();
  //编辑时才传（同步入库），新增不用传（仅入oss），直接使用已有的spuId
  if(form.id != null){
    formData.append("spuId", form.id);
  }
  formData.append("file", file);
  formData.append("fileType", fileType);
  try {
    let res;
    if (fileType === "GOODS_MAIN") {
      //主图单张上传，使用uploadImage
      res = await uploadImage(formData);
      if (res.code === 200) {
        const imgUrl = res.data;
        // 防止mainImgList为undefined，导致push报错
        if (!form.mainImgList) {
          form.mainImgList = []
        }
        form.mainImgList.push(imgUrl);
        ElMessage.success("上传成功");
        console.log("上传后：mainImgList", form.mainImgList);
        options.onSuccess(imgUrl);
      } else {
        ElMessage.error(res.msg || "上传失败");
        options.onError(new Error(res.msg));
      }
    }
  } catch (e) {
    ElMessage.error("上传请求异常");
    console.error(e);
    options.onError(e);
  }
}
/*批量上传图片*/
async function doBatchUpload(fileType) {
  let fileList;
  // 1、将详情、参数图片列表 放到 文件列表
  if (fileType === "GOODS_DETAILS") {
    fileList = detailFileList.value;
  } else if (fileType === "GOODS_PARAMS") {
    fileList = paramFileList.value;
  }
  if (!fileList || fileList.length === 0) {
    ElMessage.warning("请先选择至少一张图片！");
    return;
  }
  // =========新增校验逻辑 start=========
  // 判断是否存在新选本地图片（有raw代表本地未上传文件；回显老图片没有raw）
  const hasNewLocalFile = fileList.some(item => !!item.raw);
  if (!hasNewLocalFile) {
    ElMessage.warning("没有选择新图片，无需执行批量上传");
    return;
  }
  // =========新增校验逻辑 end=========
  // 2、将预览文件列表 转换为 FormData形参 进行批量上传，解决 el‑upload 组件不支持批量上传的问题
  const formData = new FormData();
  //编辑时才传（同步入库），新增不用传（仅入oss），直接使用已有的spuId
  if(form.id != null){
    console.log("批量上传时，传入spuId：", form.id);
    formData.append("spuId", form.id);
  }
  //⚠️注意！这里循环只把有raw的图片塞formData！老回显图片没有raw，不要往formData塞！！这个是很重要bug修复！
  for (const item of fileList) {
    if (item.raw) {
      formData.append("file", item.raw);
    }
  }
  formData.append("fileType", fileType);
  try {
    const res = await uploadImages(formData);
    console.log("批量上传结果：", res);
    if (res.code === 200) {
      const batchResult = res.data;
      if (fileType === "GOODS_DETAILS") {
        // 防止detailImgList为undefined，导致push报错
        // 注意：不能直接清空！！❗❗❗ 这里原来逻辑form.detailImgList = []会把老图片url全部清空，严重bug！
        // 只把新上传回来url追加到老数组，不要覆盖清空
        form.detailImgList.push(...batchResult.successUrlList);
        batchResult.successUrlList.forEach((url, index) => {
          //⚠️注意：只遍历【有raw的那些图片】索引映射，简单forEach按顺序依赖，前提：formData里面顺序和fileList里面new文件顺序一致
          //方案：过滤出带raw的文件列表，做一一对应
          const newFileArr = fileList.filter(i => !!i.raw);
          const fileItem = newFileArr[index];
          if (fileItem) {
            fileItem.bizUrl = url;
            fileItem.raw = null; //✅新增，清空raw
          }
        });
        // 强制更新引用，触发el‑upload重新渲染插槽
        detailFileList.value = [...detailFileList.value];
        console.log("上传后：detailImgList", form.detailImgList);
        console.log("上传后：detailFileList", detailFileList);
      } else if (fileType === "GOODS_PARAMS") {
          form.paramImgList.push(...batchResult.successUrlList);
          batchResult.successUrlList.forEach((url, index) => {
            const newFileArr = fileList.filter(i => !!i.raw);
            const fileItem = newFileArr[index];
            if (fileItem) {
              fileItem.bizUrl = url;
              fileItem.raw = null; //✅新增，清空raw
            }
          });
          paramFileList.value = [...paramFileList.value];
        console.log("上传后：paramImgList", form.paramImgList);
        console.log("上传后：paramFileList", paramFileList);
      }
      if (batchResult.failCount > 0) {
        ElMessage.warning(`部分图片上传失败：${batchResult.failMsg}`);
      } else {
        ElMessage.success("全部图片上传成功");
      }
    } else {
      ElMessage.error(res.msg || "批量上传失败");
    }
  } catch (err) {
    console.error(err);
    ElMessage.error("网络异常，批量上传失败");
  }
}
//详情图是否存在未上传本地新文件(有raw代表待上传)
const hasDetailNewFile = computed(()=>{
  return detailFileList.value.some(item => !!item.raw);
})
//参数图是否存在未上传本地新文件
const hasParamNewFile = computed(()=>{
  return paramFileList.value.some(item => !!item.raw);
})
//图片放大预览
function openImagePreview(fileList, clickFile) {
  // fileList 已经是数组，不要再 .value
  if(!fileList || !Array.isArray(fileList)) return;
  const urls = fileList.map(f => {
    return f.bizUrl ? f.bizUrl : f.url;
  })
  previewImgList.value = urls;
  const currentIndex = fileList.findIndex(f => f.uid === clickFile.uid);
  previewIndex.value = currentIndex >=0 ? currentIndex : 0;
  previewVisible.value = true;
}
//删除商品主图，先调用删除接口，成功再移除前端数组
async function onMainImgRemove(index) {
  // 删除之后的预期长度
  const expectLen = form.mainImgList.length - 1;
  if(expectLen <= 0){
    ElMessage.warning("商品主图至少保留一张，不允许全部删除");
    return;
  }
  const url = form.mainImgList[index];
  try {
    await deleteImage(url);
    //后端删除成功，再前端数组移除
    form.mainImgList.splice(index, 1);
    console.log("mainImgList删除后：", form.mainImgList);
    ElMessage.success("删除图片成功");
  } catch (err) {
    ElMessage.error("图片删除失败");
    console.error(err);
  }
}
/*详情图片点击删除（el‑upload @remove回调）*/
async function handleDetailDelete(file) {
  if (file.bizUrl) {
    // 校验：删掉这一张之后详情图是否为空
    const expectLen = form.detailImgList.length - 1;
    if(expectLen <= 0){
      ElMessage.warning("商品详情图至少保留一张，不允许全部删除");
      return;
    }
    //存在业务url，代表已经上传oss
    await deleteImage(file.bizUrl);
    //删除业务数组
    const idx = form.detailImgList.findIndex((u) => u === file.bizUrl);
    if (idx > -1) {
      form.detailImgList.splice(idx, 1);
    }
    ElMessage.success("图片删除成功");
  }
  //不管是否上传，都要删除upload列表
  const pos = detailFileList.value.findIndex((f) => f.uid === file.uid);
  if (pos > -1) {
    detailFileList.value.splice(pos, 1);
  }
  console.log("删除图片后：detailImgList", form.detailImgList);
  console.log("删除图片后：detailFileList", detailFileList);
}
/*参数图片点击删除（el‑upload @remove回调）*/
async function handleParamDelete(file) {
  if (file.bizUrl) {
    //校验：删除后参数图不能为空
    const expectLen = form.paramImgList.length - 1;
    if(expectLen <= 0){
      ElMessage.warning("商品参数图至少保留一张，不允许全部删除");
      return;
    }
    await deleteImage(file.bizUrl);
    const idx = form.paramImgList.findIndex((u) => u === file.bizUrl);
    if (idx > -1) {
      form.paramImgList.splice(idx, 1);
    }
    ElMessage.success("图片删除成功");
  }
  //不管是否上传，都要删除upload列表
  const pos = paramFileList.value.findIndex((f) => f.uid === file.uid);
  if (pos > -1) {
    paramFileList.value.splice(pos, 1);
  }
  console.log("删除图片后：paramImgList", form.paramImgList);
  console.log("删除图片后：paramFileList", paramFileList);
}
/** 提交表单 */
async function submitForm() {
  await nextTick();
  if (!spuFormRef.value) return;
  try {
    // 表单校验（基础校验，现在包含分类必填）
    await spuFormRef.value.validate();
    if (form.mainImgList.length === 0) {
      ElMessage.warning("请上传商品主图");
      return;
    }
    //详情图至少一个
    if (form.detailImgList.length === 0) {
      ElMessage.warning("详情图至少上传一张图片");
      return;
    }
    //参数图至少一个
    if (form.paramImgList.length === 0) {
      ElMessage.warning("参数图至少上传一张图片");
      return;
    }
    // 校验SKU至少一条
    if (form.skuList.length === 0) {
      ElMessage.warning("至少添加一条SKU规格");
      return;
    }
    //遍历校验每一行SKU
    for(let sku of form.skuList){
      //校验SKU图片
      if(!sku.skuImgUrl){
        ElMessage.warning("SKU规格图片不能为空！");
        return;
      }
      //校验键值对：至少一组有效规格；key不为空value不能为空
      let hasValidPair = false;
      for(let p of sku.specPairList){
        const k = p.key.trim();
        const v = p.value.trim();
        if(k && !v){
          ElMessage.warning("规格【"+k+"】必须填写规格值！");
          return;
        }
        if(k && v){
          hasValidPair = true;
        }
      }
      if(!hasValidPair){
        ElMessage.warning("每一个SKU至少填写一组规格！");
        return;
      }
      //校验售价
      if(!sku.price || sku.price <=0){
        ElMessage.warning("SKU售价不能为空并且大于0！");
        return;
      }
      //校验库存
      if(!sku.stock || Number(sku.stock) < 0){
        ElMessage.warning("SKU可用库存不能为空，不能负数！");
        return;
      }
      //把键值对转为json字符串给到skuSpec提交后端
      sku.skuSpec = pairListToJson(sku.specPairList);
    }

    let res;
    if (form.id) {
      // 编辑
      res = await updateSpu(form);
    } else {
      // 新增
      res = await addSpu(form);
    }
    if (res.code !== 200) {
      ElMessage.error(res.msg || "操作失败");
      return;
    }
    ElMessage.success("操作成功");
    dialogVisible.value = false;
    // 刷新列表
    await getList();
  } catch (err) {
    // 捕获后端业务异常，展示后端返回msg（分类不存在、商品重名、商品不存在等）
    if (err?.response?.data?.msg) {
      ElMessage.error(err.response.data.msg);
    } else {
      ElMessage.error("操作失败，请稍后重试");
    }
    console.error("商品提交异常：", err);
  }
}
/** 删除商品 */
async function handleDelete(row) {
  ElMessageBox.confirm("确定删除该商品，会级联删除SKU数据？", "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        await delSpu(row.id);
        ElMessage.success("删除成功");
        setTimeout(() => getList(), 300);
      } catch (err) {
        console.error("商品删除错误详情：", err);
        // 读取后端业务提示（分类被引用、商品不存在等）
        const tip = err?.response?.data?.msg || "删除失败";
        ElMessage.error(tip);
      }
    })
    .catch(() => {
      // 取消弹窗无操作
    });
}
onMounted(() => {
  getList();
});
</script>
<style scoped>
.page-container {
  padding: 10px;
}
.mb15 {
  margin-bottom: 15px;
}
.mt10 {
  margin-top: 10px;
}
.img-scroll-wrap {
  /* picture‑card 每张卡片大概高度：148px；两行 = 2*148，可微调 */
  max-height: 296px;
  overflow-y: auto;
  overflow-x: hidden;
}
.img-item-wrap {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  display:inline-block;
  margin-right:8px;
}
.img-item {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #eee;
}
.img-del-btn {
  position: absolute;
  right: -6px;
  top: -6px;
  width: 18px;
  height: 18px;
  background: #333;
  color: #fff;
  text-align: center;
  line-height: 18px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
}
.img-add-btn {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  vertical-align: middle;
}
.pic-card-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
.upload-ok-mark {
  position: absolute;
  top: 4px;
  right: 24px; /*避开右上角删除按钮，不要和×重叠！重点！原来right:4px会跟删除按钮打架*/
  background: #67c23a;
  color: #fff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 14px;
}
/*SKU图片单元格*/
.sku-img-cell{
  width:100%;
  height:100px;
}
.sku-img-wrap{
  position:relative;
  width:80px;
  height:80px;
}
.sku-img{
  width:80px;
  height:80px;
  border:1px solid #eee;
  border-radius:4px;
}
.sku-img-del{
  position:absolute;
  right:-5px;
  top:-5px;
  width:18px;
  height:18px;
  background:#333;
  color:#fff;
  text-align:center;
  line-height:18px;
  border-radius:50%;
  cursor:pointer;
  font-size:14px;
}
.sku-add-btn{
  width:80px;
  height:80px;
  border:1px dashed #ccc;
  border-radius:4px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
  color:#999;
  cursor:pointer;
}
/*规格键值对编辑器*/
.sku-spec-editor{
  width:100%;
}
.pair-row{
  display:flex;
  gap:6px;
  align-items:center;
  margin-bottom:6px;
}
.sep{
  font-size:16px;
  color:#666;
}
.pair-row .el-input{
  flex:1;
}
.cuo{
  width:30px;
  height:30px;
}
</style>
