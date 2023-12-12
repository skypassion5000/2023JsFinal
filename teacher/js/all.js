// 取得產品列表
const productList = document.querySelector('.productWrap');
let productData = [];
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (res) {
      productData = res.data.products;
      renderProductList();
    })
    .catch(function (err) {
      console.log(err);
    })
}
// 畫面渲染
function renderProductList() {
  let str = "";
  productData.forEach( item => {
    str += combineStr(item);
  });
  productList.innerHTML = str;
}

// 組產品字串
function combineStr(item){
  return `<li class="productCard">
            <h4 class="productType">${item.category}</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id =${item.id}>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`;
}
// 下拉選單綁定事件
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change',function(e){
  console.log(e.target.value);
  const category = e.target.value;
  if (category == "全部"){
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach( item => {
    if (item.category == category){
      str += combineStr(item);
    }
  });
  productList.innerHTML = str;
});

// 加入購物車
productList.addEventListener('click', function(e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute('class');
  // console.log(e.target.getAttribute('class'));
  if (addCartClass !== "addCardBtn"){
    alert("不要亂按");
    return;
  }
  let productId = e.target.getAttribute('data-id');
  // console.log(productId);

  // 判斷購物車是否有同樣品項
  let numCheck = 1;
  cartData.forEach(function(item){
    if (item.product.id === productId){
      numCheck = item.quantity + 1;
    }
  })
  // console.log(numCheck);

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    data: {
      productId: productId,
      quantity: numCheck
    }
  }).then(function (res) {
      // console.log(res);
      alert('加入購物車');
      getCartList();
    })
})

// 取得購物車列表
const cartList = document.querySelector('.shoppingCart-tableList');
let cartData = [];
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (res) {
      // console.log(res.data.finalTotal);
      document.querySelector('.js-total').textContent = toThousands(res.data.finalTotal);
      cartData = res.data.carts;
      // console.log(cartData);
      let str = "";
      cartData.forEach(function (item){
        str += `<tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${toThousands(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${toThousands(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id=${item.id}>
                clear
            </a>
        </td>
      </tr>`;
      });
      
      cartList.innerHTML = str;
    })
    .catch(function (err) {
      console.log(err);
    })
}

// 刪除購物車產品
cartList.addEventListener('click', function (e) {
  e.preventDefault();
  console.log(e.target);
  const cartId = e.target.getAttribute('data-id');
  if (cartId == null){
    alert('你點到其他了');
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(res){
      alert('刪除單筆購物車成功');
      getCartList();
    })
})

// 刪除全部購物車品項
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e) {
  e.preventDefault();
  // console.log(e.target);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(res){
      alert('刪除全部購物車成功');
      getCartList();
    })
    .catch(function(err){
      alert('購物車已經清空，請勿重複點擊');
    });
})

// 送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
// console.log(orderInfoBtn,"orderInfoBtn");
orderInfoBtn.addEventListener('click',function(e){
  e.preventDefault();
  // console.log('你被點擊了');  
  if(cartData.length == 0){
    alert('請加入購物車');
    return;
  }

  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerTradeWay = document.querySelector('#tradeWay').value;
  // console.log(customerName,customerPhone,customerEmail,customerAddress,customerTradeWay);
  if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == ""){
    alert('請輸入訂單資訊');
    return;
  }
  if(validatePhone(customerPhone) == false){
    alert('請填寫正確的電話號碼');
    return;
  }
  if(validateEmail(customerEmail) == false){
    alert('請填寫正確的email');
    return;
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    data: {
      user: {
        name: customerName,
        tel: customerPhone,
        email: customerEmail,
        address: customerAddress,
        payment: customerTradeWay
      }
    }
  }).then(function (res) {
      // console.log(res);
      alert('訂單建立成功');
      document.querySelector('#customerName').value = "";
      document.querySelector('#customerPhone').value = "";
      document.querySelector('#customerEmail').value = "";
      document.querySelector('#customerAddress').value = "";
      document.querySelector('#tradeWay').value = "ATM";
      getCartList();
    })
})

// 初始化
function init(){
  getProductList();
  getCartList();
}
init();

// util js、元件
function toThousands(x){ // 千分位設計
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
  return parts.join(".");
}

function validateEmail(email) { // email驗證
  if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
    return true;
  }else{
    return false;
  }
}

function validatePhone(phone) { // 電話驗證
  if (/(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})$/.test(phone)){
    return true;
  }else{
    return false;
  }
}