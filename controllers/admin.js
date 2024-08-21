const { validationResult } = require('express-validator');

const Product = require('../models/product');


// Add Product GET and POST
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', { 
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    isAuthenticated: req.session.isLoggedIn 
  });
};

// Adding new product to Database
exports.postAddProduct =  (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      isAuthenticated: req.session.isLoggedIn 
    });
}
  const product = new Product({
    title: title, 
    price: price, 
    description: description, 
    imageUrl: imageUrl,
    userId: req.user // mongoose will get the id automatically 
  });
  product
    .save() // included in mongoose
    .then(result => {
      console.log('Product Created');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

// Edit product details in Database
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if(!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        isAuthenticated: req.session.isLoggedIn 
      });
    }) 
    .catch(err => console.log(err));
};

// Posting edited product details in Database
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDes = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDes,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      isAuthenticated: req.session.isLoggedIn 
    });
}

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDes;
      product.imageUrl = updatedImageUrl;
      return product.save()
        .then(result => {
          console.log('Product Updated');
          res.redirect('/admin/products');
      });
  }) 
  .catch(err => console.log(err));
};

// Admin products GET
exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select('title price -_id') fecthing required fields and selecting what to dispaly
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products, 
        pageTitle: 'Admin Products', 
        path:'/admin/products',
        isAuthenticated: req.session.isLoggedIn  // req.session.user can also be used to check if user object is set
      });
    })
    .catch(err => {
      console.log(err);
    })
};

// Delete product from Database 
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('Product Deleted');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err))
};