// 取得訂單列表
let orderData = [];
const orderList = document.querySelector('.js-orderList');
// console.log(orderList);
function getOrderList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
      'Authorization' : token
    }
  }).then(function(res){
    orderData = res.data.orders;
    console.log(orderData);

    // 組訂單字串
    let str = "";
    orderData.forEach(function(order){
      // 組時間字串
      const timestamp =new Date(order.createdAt*1000);
      const orderTime =`${timestamp.getFullYear()}/${timestamp.getMonth()+1}/${timestamp.getDate()}`;
      // 組產品字串
      let productStr = "";
      order.products.forEach(function(product){
        productStr += `<p>${product.title} x ${product.quantity}</p>`;
      })
      // 判斷訂單處理狀態
      let orderStatus = "";
      if (order.paid == true){
        orderStatus = "已處理";
      }else{
        orderStatus = "未處理";
      }

      str += `<tr>
                <td>${order.id}</td>
                <td>
                  <p>${order.user.name}</p>
                  <p>${order.user.tel}</p>
                </td>
                <td>${order.user.address}</td>
                <td>${order.user.email}</td>
                <td>
                  <p>${productStr}</p>
                </td>
                <td>${orderTime}</td>
                <td class="orderStatus">
                  <a href="#" data-status=${order.paid} data-id=${order.id} class="js-orderStatus">${orderStatus}</a>
                </td>
                <td>
                  <input type="button" class="delSingleOrder-Btn" data-id=${order.id} value="刪除">
                </td>
            </tr>`;
    });
    orderList.innerHTML = str;
    renderC3_lv2();
  })
}

// 綁定事件：監聽 變更訂單狀態、刪除訂單
orderList.addEventListener('click', function(e){
  e.preventDefault();
  console.log(e.target.getAttribute('class'));
  const targetClass = e.target.getAttribute('class');
  // 取得點擊ID
  let id = e.target.getAttribute('data-id');
  if(targetClass == "js-orderStatus"){
    // alert('變更訂單狀態');
    let status = e.target.getAttribute('data-status');
    changeOrderStatus(id, status);
    return;
  }
  if(targetClass == "delSingleOrder-Btn"){
    deleteOrderItem(id);
    return;
  }
})

// 變更訂單狀態
function changeOrderStatus(id, status) {
  // console.log(id, status);
  // 變更狀態
  let newStatus = "";
  if (status == "true") {
    newStatus = false;
  }else {
    newStatus = true;
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    "data": {
      "id": id,
      "paid": newStatus
    }
  },{
    headers:{
      'Authorization' : token
    }
  }).then(function(res){
    alert('修改訂單狀態成功');
    getOrderList();
  })
}

// 刪除單筆訂單
function deleteOrderItem(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
    headers:{
      'Authorization' : token
    }
  }).then(function(res){
    alert('刪除單筆訂單成功');
    getOrderList();
  })
}

// 清除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  // console.log("discardAllBtn");
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
      'Authorization' : token
    }
  }).then(function(res){
    alert('刪除全部訂單成功');
    getOrderList();
  })
})

function renderC3() {
  // 物件資料收集：跑兩個forEach去歸納成需要的物件資料
  // {床架: 63780, 窗簾: 2400, 收納: 5340}
  let obj = {};
  orderData.forEach((order) => {
    order.products.forEach((product) =>{
      if (obj[product.category] == undefined){
        obj[product.category] = product.price * product.quantity;
      }else{
        obj[product.category] += product.price * product.quantity;
      }
    })
  });
  console.log(obj);
  
  // 做出資料關聯
  // ['床架', '窗簾', '收納']
  let categoryAry = Object.keys(obj);
  console.log(categoryAry);

  // [ ['床架', 63780], ['窗簾', 2400], ['收納', 5340] ]
  let newData = [];
  categoryAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    newData.push(ary);
  })
  console.log(newData);
  
  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        colors:{
          "床架":"#DACBFF",
          "收納":"#9D7FEA",
          "窗簾": "#5434A7",
          "其他": "#301E5F",
        }
    },
  });
}

function renderC3_lv2() {
  // 物件資料收集：跑兩個forEach去歸納成需要的物件資料
  let obj = {};
  orderData.forEach((order) => {
    order.products.forEach((product) =>{
      if (obj[product.title] == undefined){
        obj[product.title] = product.price * product.quantity;
      }else{
        obj[product.title] += product.price * product.quantity;
      }
    })
  });
  console.log(obj);
  
  // 做出資料關聯
  let originAry = Object.keys(obj);
  console.log(originAry);

  // 透過 originAry，整理成 C3 格式
  let rankSortAry = [];
  originAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  })
  console.log(rankSortAry);

  // console.log(rankSortAry,"未排序");
  // sort 排序：比大小，降冪排列
  // 目的：取前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊
  rankSortAry.sort(function (a, b) {
    return b[1] - a[1];
  })
  console.log(rankSortAry);

  // 如果筆數超過4筆以上，就統整為其它
  if (rankSortAry.length > 3){
    let otherTotal = 0;
    rankSortAry.forEach(function(item,index){
      if(index >2){
        // otherTotal += rankSortAry[index][1];
        otherTotal += item[1]; 
      }
    })
    rankSortAry.splice(3,rankSortAry.length - 3);
    rankSortAry.push(['其他', otherTotal]);
    // 再排序一次
    rankSortAry.sort(function (a, b) {
      return b[1] - a[1];
    })
  }
  console.log(rankSortAry);
  
  // 顯示 C3.js 圖表
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: rankSortAry,
    },
    color:{
      pattern:["#301E5F","#5434A7","#9D7FEA","#DACBFF"]
    }
  });
  
}

// 初始化
function init() {
  getOrderList();
}
init();