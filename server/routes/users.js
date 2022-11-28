const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async (req, res) => {
  try {
      res.json(await User.findUnassignedStudents());
  } catch (err) {
      throw err
  }
})

router.get('/teachers', async (req, res) => {
  try {
      res.json(await User.findTeachersAndMentees());
  } catch (err) {
      throw err
  }
})

router.delete('/:index', async (req, res) => {
  try {
      const userId = req.params.index;
      if (isNaN(userId)) {
        res.sendStatus(400);
      } else {
        const userWithGivenId = await User.findById(userId);
        if (userWithGivenId.length === 0) {
          res.sendStatus(404);
        } else {
          await User.destroy({
            where: {
              id: userId
            }
          })
          res.sendStatus(204);
        }
      }
  } catch (err) {
      throw err;
  }
})

router.post('/', async (req, res) => {
  try {
    const isUnique = await User.findByName(req.body.name)
    if (isUnique.length > 0) {
      res.sendStatus(409)
    } else {
      const newUser = await User.create({ name: req.body.name })
      res.status(201).json(newUser)
    }
  } catch (err) {
      throw err
  }
})

router.put('/:id', async (req, res) => {
  const userToUpdate = await User.findById(req.params.id);
  if (userToUpdate.length > 0) {
    res.status(200).json(updatedUser)
  } else {
    res.sendStatus(404)
  }

})

module.exports = router;
