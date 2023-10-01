const SERVER_NAME = 'products-api';
const PORT = 3000;
const HOST = '127.0.0.1';

const errors = require('restify-errors');
const restify = require('restify');

// Get a persistence engine for the products
const productsSave = require('save')('products');

let getRequestCount = 0;
let postRequestCount = 0;

// Create the restify server
const server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url);
  console.log('**** Resources: ****');
  console.log('********************');
  console.log(' /products');
  console.log(' /products/:id');
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all products in the system
server.get('/products', function (req, res, next) {
  console.log('GET /products params=>' + JSON.stringify(req.params));
  getRequestCount++;

  console.log(`Processed Request Count--> Get: ${getRequestCount}, Post: ${postRequestCount}`);

  // Find every entity within the given collection
  productsSave.find({}, function (error, products) {
    if (error) {
      return next(new errors.InternalServerError('An error occurred while fetching products'));
    }

    // Return all of the products in the system
    res.send(products);
    return next();
  });
});

// Get a single product by its product id
server.get('/products/:id', function (req, res, next) {
  console.log('GET /products/:id params=>' + JSON.stringify(req.params));
  getRequestCount++;
  console.log(`Processed Request Count--> Get: ${getRequestCount}, Post: ${postRequestCount}`);

  // Use req.params.id to get the product ID from the URL
  const productId = req.params.id;

  // Find a single product by its ID within save
  productsSave.findOne({ _id: productId }, function (error, product) {
    if (error) {
      return next(new errors.InternalServerError('An error occurred while fetching the product'));
    }

    if (product) {
      // Send the product if it exists
      res.send(product);
    } else {
      // Send a 404 header if the product doesn't exist
      res.send(404);
    }

    return next();
  });
});

// Create a new product
server.post('/products', function (req, res, next) {
  console.log('POST /products params=>' + JSON.stringify(req.params));
  console.log('POST /products body=>' + JSON.stringify(req.body));
  postRequestCount++;

  console.log(`Processed Request Count--> Get: ${getRequestCount}, Post: ${postRequestCount}`);

  // Validation of mandatory fields
  if (!req.body || req.body.name === undefined || req.body.price === undefined || req.body.quantity === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name, price, and quantity must be supplied'));
  }

  const newProduct = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
  };

  // Create the product using the persistence engine
  productsSave.create(newProduct, function (error, product) {
    if (error) {
      return next(new errors.InternalServerError('An error occurred while creating the product'));
    }

    // Send the product if no issues
    res.send(201, product);
    return next();
  });
});

// Update a product by its id
server.put('/products/:id', function (req, res, next) {
  console.log('PUT /products/:id params=>' + JSON.stringify(req.params));
  console.log('PUT /products/:id body=>' + JSON.stringify(req.body));

  // Validation of mandatory fields
  if (!req.body || req.body.name === undefined || req.body.price === undefined || req.body.quantity === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name, price, and quantity must be supplied'));
  }

  const updatedProduct = {
    _id: req.params.id, // Assuming you're updating by ID
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
  };

  // Update the product with the persistence engine
  productsSave.update(updatedProduct, function (error) {
    if (error) {
      return next(new errors.InternalServerError('An error occurred while updating the product'));
    }

    // Send a 200 OK response
    res.send(200);
    return next();
  });
});

// Delete product with the given id
server.del('/products/:id', function (req, res, next) {
  console.log('DELETE /products/:id params=>' + JSON.stringify(req.params));

  // Delete the product with the persistence engine
  productsSave.delete(req.params.id, function (error) {
    if (error) {
      return next(new errors.InternalServerError('An error occurred while deleting the product'));
    }

    // Send a 204 response
    res.send(204);
    return next();
  });
});
