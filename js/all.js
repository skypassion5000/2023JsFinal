// 取得產品列表
let productsData = [];
const productList = document.querySelector('.productWrap');
// console.log(productList);
function getProducts(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
  .then(function(res){
    // console.log(res.data.products);
    productsData = res.data.products;
    console.log(productsData);
    let str = "";
    productsData.forEach(function(productItem){
      str += combineStr(productItem);
    })
    productList.innerHTML = str;
  })
}

// 組產品字串
function combineStr(item){
  return `<li class="productCard">
            <h4 class="productType">${item.category}</h4>
            <img src=${item.images} alt="">
            <a href="#" data-id=${item.id} class="addCardBtn">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`;
}

// 產品下拉選單綁定事件篩選
const productSelect = document.querySelector('.productSelect');
// console.log(productSelect);
productSelect.addEventListener('change', (e) =>{
  console.log(e.target.value);
  const category = e.target.value;
  if(category == "全部"){
    getProducts();
    return;
  }
  let str = "";
  productsData.forEach(product => {
    if (product.category == category){
      str += combineStr(product);
    }
  })
  productList.innerHTML = str;
})

// 取得購物車列表
let cartData = [];
const cartList = document.querySelector('.js-cartList');
// console.log(cartList);
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(res){
    cartData = res.data.carts;
    console.log(cartData);

    // 取得購物車總金額
    document.querySelector('.js-total').textContent = toThousands(res.data.finalTotal);
    let str = "";
    cartData.forEach(function(cartItem){
      str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src=${cartItem.product.images} alt="">
                        <p>${cartItem.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(cartItem.product.price)}</td>
                <td>${cartItem.quantity}</td>
                <td>NT$${toThousands(cartItem.product.price * cartItem.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" data-id=${cartItem.id} class="material-icons">
                        clear
                    </a>
                </td>
            </tr>`;
    })
    cartList.innerHTML = str;
  });
}

// 加入購物車
productList.addEventListener('click',function(e){
  e.preventDefault();

  // 取得點擊的class，判斷是否addCardBtn
  let addCartClass =e.target.getAttribute('class');
  if(addCartClass !== "addCardBtn"){
    alert('不要亂按');
    return;
  }

  // 取得產品ID
  productId = e.target.getAttribute('data-id');
  // console.log(productId);

  let numCheck = 1;
  cartData.forEach(function(item){
    if (item.product.id === productId){
      numCheck = item.quantity + 1
    }
  });

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  })
  .then(function(res){
    // console.log(res);
    alert('加入購物車');
    getCartList();
  })
}); 

// 刪除購物車產品
cartList.addEventListener('click',(e) => {
  e.preventDefault();
  const CardId = e.target.getAttribute('data-id');
  // console.log(CardId);
  if (CardId == null){
    alert('你沒點到');
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${CardId}`)
  .then(function(res){
    // console.log(res);
    alert('刪除單筆購物車成功');
    getCartList();
  });
});

// 刪除所有購物車
const discardAllBtn = document.querySelector('.discardAllBtn');
// console.log(discardAllBtn);
discardAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(res){
    // console.log(res);
    alert('刪除所有購物車成功');
    getCartList();
  })
  .catch((err) => {
    alert('購物車已經清空，請勿重複點擊');
  });
});

// 送出訂單
const inputs = document.querySelectorAll("input[name]");
const form = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const messages = document.querySelectorAll('[data-message]');
// console.log(inputs,inputs[0]);
orderInfoBtn.addEventListener('click',(e)=>{
  e.preventDefault();

  // 確認購物車有沒有東西
  if (cartData.length == 0){
    alert('請加入購物車');
    return;
  }
  // 取得欄位確認有沒有填寫
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const tradeWay = document.querySelector('#tradeWay').value;

  // if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == ""){
  //   alert('請輸入訂單資訊');
  //   return;
  // }

  // 資料驗證（電話）
  // 資料驗證（email）
  let errors = validate(form, constraints); // 通過驗證會是 undefined
  console.log(errors);
  if(errors){
    messages.forEach(function(item){
      item.textContent = errors[item.dataset.message];
    })
    return;
  }else{
    messages.forEach(function(item){
      item.textContent = "";
    })
  }

  // API訂單送出
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  })
  .then(function(res){
    // console.log(res);
    alert('送出訂單成功');
    // 表單恢復預設
    form.reset();
    getCartList();
  })
});


// 初始化
function init(){
  getProducts();
  getCartList();
}
init();

// util js 
function toThousands (value) { // 千分位
  if (value) {
    value += "";
    var arr = value.split(".");
    var re = /(\d{1,3})(?=(\d{3})+$)/g;

    return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
  } else {
    return ''
  }
}

// 驗證表單自訂欄位
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    // length: {
    //   minimum: 8,
    //   message: "需超過 8 碼"
    // },
    format: {
      pattern: /(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})$/,
      message: "請輸入正確的格式"
    }
  },
  "Email": {
    presence: {
      message: "必填欄位"
    },
    // email: {
    //   message: "格式錯誤"
    // },
    format: {
      pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      message: "請輸入正確的格式"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};