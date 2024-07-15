const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async(req, res) => {
  // find all products
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }});

// get one product
router.get('/:id', async(req, res) => {
  // find a single product by its `id`
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }});

// create new product
router.post('/', (req, res) => {
  const { product_name, price, stock, tagIds } = req.body;
 
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async(req, res) => {
  // update product data
  try {
    const productId = req.params.id;
  const updatedProduct = await Product.update(req.body, {
    where: {
      id: productId,
    },
  });

  if (!updatedProduct[0]) {
    return res.status(404).json({ message: `Product with id ${productId} not found.` });
  }

  // If there are tagIds in the request body, update ProductTag associations
  if (req.body.tagIds && req.body.tagIds.length) {
    const productTags = await ProductTag.findAll({
      where: { product_id: productId }
    });

    // Extract existing tag_ids associated with the product
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Filter out tags to add and remove
    const tagsToAdd = req.body.tagIds.filter(tag_id => !productTagIds.includes(tag_id));
    const tagsToRemove = productTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id));

    // Create new associations for tags to add
    const newProductTags = tagsToAdd.map(tag_id => ({
      product_id: productId,
      tag_id,
    }));

    // Bulk create new associations and delete removed associations
    await Promise.all([
      ProductTag.destroy({ where: { id: tagsToRemove.map(({ id }) => id) } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
  }

  res.status(200).json({ message: `Product with id ${productId} has been updated.` });
} catch (err) {
  console.error(err);
  res.status(500).json(err);
}
});

  // delete one product by its `id` value
router.delete('/:id', async(req, res) => {
  try {
    const productId = req.params.id;

    // Delete the product by id
    const deletedProduct = await Product.destroy({
      where: {
        id: productId,
      },
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: `Product with id ${productId} not found.` });
    }

    // Also delete associated entries in ProductTag
    await ProductTag.destroy({
      where: {
        product_id: productId,
      },
    });

    res.status(200).json({ message: `Product with id ${productId} has been deleted.` });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
