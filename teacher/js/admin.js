let orderData =[];
const orderList = document.querySelector('.js-orderList');

// 取得訂單列表
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
      'Authorization': token
    }
  }).then(function(res){
    // console.log(res.data.orders);
    orderData = res.data.orders;
    let str = "";
    orderData.forEach((item) => {
      // 組時間字串
      const timestamp = new Date(item.createdAt*1000);
      const orderTime = `${timestamp.getFullYear()}/${timestamp.getMonth()+1}/${timestamp.getDate()}`;
      // 組產品字串
      let productStr = "";
      item.products.forEach((productItem) => {
        productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
      })
      // 判斷訂單處理狀態
      let orderStatus = "";
      if(item.paid == true) {
        orderStatus = "已處理";
      }else{
        orderStatus = "未處理";
      }
      // 組訂單字串
      str += `<tr>
                <td>${item.id}</td>
                <td>
                  <p>${item.user.name}</p>
                  <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                  ${productStr}
                </td>
                <td>${orderTime}</td>
                <td class="js-orderStatus">
                  <a href="#" data-status=${item.paid} class="orderStatus" data-id=${item.id}>${orderStatus}</a>
                </td>
                <td>
                  <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id=${item.id} value="刪除">
                </td>
              </tr>`;
    })
    orderList.innerHTML = str;
    renderC3_lv2();
  })
}
// 綁定事件 訂單狀態、刪除
orderList.addEventListener("click",function(e){
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  // console.log(targetClass);

  let id = e.target.getAttribute("data-id");

  if(targetClass == "delSingleOrder-Btn js-orderDelete"){
    deleteOrderItem(id);
    return;
  }

  if(targetClass == "orderStatus"){
    let status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
    return;
  }
})

// 刪除訂單
function deleteOrderItem(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
    headers:{
      'Authorization': token
    }
  }).then(function(res){
    alert("刪除");
    getOrderList();
  })
}

// 修改訂單狀態
function changeOrderStatus(status, id) {
  console.log(status, id);
  let newStatus = "";
  if (status == "true"){
    newStatus = false;
  }else{
    newStatus = true;
  }
  console.log(newStatus,"newStatus");
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    "data": {
      "id": id,
      "paid": newStatus
    }
  }
  ,{
    headers:{
      'Authorization': token
    }
  }).then(function(res){
    alert('修改訂單狀態成功');
    getOrderList();
  })
}

// 清除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',(e) => {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
      'Authorization': token
    }
  }).then(function(res){
    alert("刪除全部訂單成功");
    getOrderList();
  })
});

// 渲染C3
function renderC3() {
  console.log(orderData);
  // 物件資料收集
  let total = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(total[productItem.category] == undefined){
        total[productItem.category] = productItem.price * productItem.quantity;
      }else{
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    })
  })
  console.log(total);
  // 做出資料關聯
  let categoryAry = Object.keys(total);
  console.log(categoryAry);

  let newData = []; // 外層陣列
  categoryAry.forEach(function (item) {
    let ary = []; // 內層陣列
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary); // 內層加到外層
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
function renderC3_lv2(){
  console.log(orderData);
  // 資料收集
  let obj = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(obj[productItem.title] == undefined){
        obj[productItem.title] = productItem.price * productItem.quantity;
      }else{
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    })
  })
  console.log(obj);
  
  // 拉出資料關聯的key值
  let originAry = Object.keys(obj);
  console.log(originAry);

  // 透過 originAry，整理成 C3 格式
  let rankSortAry = [];

  originAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
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
    rankSortAry.forEach(function(item, index){
      if ( index > 2){
        otherTotal += rankSortAry[index][1];
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
function init(){
  getOrderList();
}
init();