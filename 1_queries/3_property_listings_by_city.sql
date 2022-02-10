SELECT properties.*, AVG(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews on properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY cost_per_night
limit 10;