const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async(req, res) => {
  // find all tags
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'products' }],
    });
    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }});

router.get('/:id', async(req, res) => {
  // find a single tag by its `id`
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'products' }],
    });

    if (!tag) {
      res.status(404).json({ message: `Tag with id ${req.params.id} not found.` });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }});

  // create a new tag
router.post('/', async(req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

  // update a tag's name by its `id` value
router.put('/:id', async(req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updatedTag[0]) {
      res.status(404).json({ message: `Tag with id ${req.params.id} not found.` });
      return;
    }

    res.status(200).json({ message: `Tag with id ${req.params.id} has been updated.` });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

  // delete on tag by its `id` value
router.delete('/:id', async(req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deletedTag) {
      res.status(404).json({ message: `Tag with id ${req.params.id} not found.` });
      return;
    }

    res.status(200).json({ message: `Tag with id ${req.params.id} has been deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
