const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// pool.co
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryString = `SELECT * FROM users
    WHERE users.email = $1`;
  const userEmail = [email];
  return pool.query(queryString, userEmail)
    .then(res => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `SELECT * FROM users
  WHERE users.id = $1`
  const userId = [id];
  return pool.query(queryString, userId)
    .then(res => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err.message)
    });
}

// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// }
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const name = user.name;
  const email = user.email;
  const password = user.password;
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3) 
    RETURNING * `
  return pool.query(queryString, [name, email, password])
    .then(res => {
      return res.rows[0]
    })
    .catch(err => err.message)
}

// const addUser = function(user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// }
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */



//const getAllReservations = function(guest_id, limit = 10) {

// const getAllReservations = function(guest_id, limit = 10) {
//   return pool.query(
//     `SELECT reservations.*, properties.title, properties.cost_per_night, properties.thumbnail_photo_url, properties.number_of_bedrooms, properties.number_of_bathrooms, properties.parking_spaces, avg(property_reviews.rating) as average_rating
//   FROM reservations
//   JOIN properties ON properties.id = reservations.property_id
//   JOIN property_reviews ON properties.id = property_reviews.property_id
//   WHERE reservations.guest_id = $1
//   GROUP BY properties.id, reservations.id
//   LIMIT $2;`, [guest_id, limit])
//     .then(res => {
//       return res.rows
//     })
//     .catch((err) => err.message);
// }
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `SELECT reservations.*, properties.*, avg(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON reservations.id = property_reviews.reservation_id
    WHERE reservations.guest_id = $1
    AND reservations.start_date !=  now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2`
  return pool.query(queryString, [guest_id, limit])
    .then(res => {
      return res.rows
    })
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  // if (options.minimum_price_per_night) {
  //   queryParams.push(U)
  // }

  queryParams.push(limit);
  queryString += `
  GROUP by properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};`
    ;
  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams).then(res => res.rows)
};
exports.getAllProperties = getAllProperties;

// SELECT properties.*, AVG(property_reviews.rating) as average_rating
// FROM properties
// JOIN property_reviews on properties.id = property_id
// WHERE city LIKE '%ancouv%'
// GROUP BY properties.id
// HAVING AVG(property_reviews.rating) >= 4
// ORDER BY cost_per_night
// limit 10;

// return pool
//   .query(`SELECT * FROM properties LIMIT $1`, [limit])
//   .then((result) => result.rows)
//   .catch((err) => {
//     console.log(err.message);
//   });

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
