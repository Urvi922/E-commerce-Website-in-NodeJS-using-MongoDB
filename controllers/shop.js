const Product = require('../models/product');
const Order = require('../models/order');

  // Shop Product list GET
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products, 
        pageTitle: 'All Products', 
        path:'/products'
      });
    })
    .catch(err => {
    console.log(err);
  });
};

 // Product details GET
exports.getProduct = (req,res,next) => {
  const prodId = req.params.productId;
  Product.findById(prodId) // findbyid is given by mongoose
    .then(product => {
      res.render('shop/product-detail', {
        product: product, 
        pageTitle: product.title,
        path: '/products' 
      });
    })
    .catch(err => console.log(err));
};
 
// Shop Index GET 
exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products, 
        pageTitle: 'Shop', 
        path:'/'
      });
    })
    .catch(err => {
    console.log(err);
  });
};

// Cart details GET
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path : '/cart',
        pageTitle: 'Your Cart',
        products: products
      });  
    })
    .catch(err => console.log(err));
};


// Adding products to Cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};


// Deleting products from Cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};


// Posting Cart products to Databse
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      console.log(user.cart.items);
      const products = user.cart.items.map( i => {
        return { quantity: i.quantity, product: { ...i.productId._doc }};
      });

      let totalPrice = 0;
      for (let i = 0; i < user.cart.items.length; i++) {
        totalPrice += user.cart.items[i].quantity * user.cart.items[i].productId.price;
      }

      let totalQuantity = 0;
      for (let j = 0; j < user.cart.items.length; j++) {
        totalQuantity += user.cart.items[j].quantity
      }

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products,
        totalPrice: totalPrice,
        totalQuantity: totalQuantity
      });
      return order.save();
    })
    .then(result => {
      req.user.clearCart(); 
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

// Getting Cart product to display in Order
exports.getOrders = (req, res, next) => {
  Order.find({
      'user.userId': req.user._id 
    })
    .then(orders => {
      res.render('shop/orders', {
        path : '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });     
    })
    .catch(err => console.log(err));
};