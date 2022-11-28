const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },

  userType: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "STUDENT",
    validate: {
      isIn: [["STUDENT", "TEACHER"]]
    }
  },

  isStudent: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === "STUDENT" ? true : false;
    }
  },

  isTeacher: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === "TEACHER" ? true : false;
    }
  },

});

User.findUnassignedStudents = function () {
  return User.findAll({
    where: {
      userType: "STUDENT",
      mentorId: null
    }
  })
}

User.findTeachersAndMentees = function () {
  return User.findAll({
    include: 'mentees',
    where: {
      userType: "TEACHER"
    }
  })
}

User.findById = function (index) {
  return User.findAll({
    where: {
      id: index
    }
  })
}

User.findByName = function (searchName) {
  return User.findAll({
    where: {
      name: searchName
    }
  })
}

User.beforeUpdate(async user => {
  const mentor = await User.findAll({
    where: {
      id : user.mentorId
    }
  })

  const mentee = await User.findAll({
    where: {
      mentorId : user.id
    }
  })

  if (mentor.length > 0 && mentor[0].dataValues.userType === "STUDENT") {
    throw new Error("Can't assign a student as a mentor");
  }
  
  if (user.mentorId && user.dataValues.userType === "TEACHER") {
    throw new Error("Student can't become a teacher while having a mentor");
  }

  if (mentee.length > 0 && user.dataValues.userType === "STUDENT") {
    throw new Error("Teacher can't become student while having mentees");
  }
})

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
