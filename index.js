const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all origins

// Database connection
const db = mysql.createConnection({
    host: "72.167.226.12", 
    user: "dbadmin",     
    password:"mypassword!!44777", 
    database: "Staging" ,
});

db.connect(error => {
    if (error) throw error;
    console.log('Successfully connected to the database.');
});



// Define a route to fetch the first 10 parts
// Define a route to fetch the first 10 parts
// app.get('/api/parts', async(req, res) => {
//     try {
//         const { page, limit } = req.query;
//         const offset = (page - 1) * limit;
        
//         // Corrected SQL query with proper 'LIMIT' and 'OFFSET'
//         db.query('SELECT * FROM parts LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)], (error, data) => {
//             if (error) {
//                 console.log(error);
//                 res.status(500).send('Error fetching parts data');
//                 return;
//             }
            
//             db.query('SELECT COUNT(*) as count FROM parts', (countError, totalPageData) => {
//                 if (countError) {
//                     console.log(countError);
//                     res.status(500).send('Error counting parts');
//                     return;
//                 }
                
//                 const totalPage = Math.ceil(totalPageData[0].count / limit);
                
//                 res.json({
//                     data: data,
//                     pagination: {
//                         page: parseInt(page),
//                         limit: parseInt(limit),
//                         totalPage: totalPage
//                     }
//                 });
//             });
//         });
//     } catch (e) {
//         console.log(e);
//         res.status(500).send('Server error');
//     }
// });
// const util = require('util');
// const dbQuery = util.promisify(db.query).bind(db);

// // search
// app.get('/parts/:search', async (req, res) => {
//     try {
//         const { search } = req.params; // Correctly destructure search from req.params
//         const searchQuery = `%${search}%`;

//         db.query('SELECT * FROM parts WHERE Description LIKE ?', [searchQuery], (error, data) => {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send('Error fetching parts data');
//                 return;
//             }

//             res.json({ data });
//         });
//     } catch (e) {
//         console.error(e);
//         res.status(500).send('Server error');
//     }
// });

// sugge
// Updated backend code
app.get('/api/parts', async(req, res) => {
    try {
      const { page, limit, search } = req.query;
      const offset = (page - 1) * limit;
      const searchQuery = search ? `%${search}%` : '%';
  
      db.query('SELECT * FROM parts WHERE Description LIKE ? LIMIT ? OFFSET ?', [searchQuery, parseInt(limit), parseInt(offset)], (error, data) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error fetching parts data');
          return;
        }
  
        db.query('SELECT COUNT(*) as count FROM parts WHERE Description LIKE ?', [searchQuery], (countError, totalPageData) => {
          if (countError) {
            console.log(countError);
            res.status(500).send('Error counting parts');
            return;
          }
  
          const totalPage = Math.ceil(totalPageData[0].count / limit);
  
          res.json({
            data: data,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              totalPage: totalPage
            }
          });
        });
      });
    } catch (e) {
      console.log(e);
      res.status(500).send('Server error');
    }
  });
  


// Define a route to fetch a product by its ID
app.get('/api/parts/:ID', (req, res) => {
    const productId = req.params.ID;
    const sql = `SELECT * FROM parts WHERE ID = ${productId}`;
    db.query(sql, [productId], (error, results) => {
        if (error) {
            res.status(500).send('Error fetching product data');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Product not found');
            return;
        }
        res.json(results[0]);
    });
});

//get imgFiles
app.get('/api/partinfo/:ID', (req, res) => {
    const productId = req.params.ID;
    // SQL query to fetch the product information including ImageFile
    const sql = `SELECT * FROM partinfo WHERE ID = ${productId}`;
    db.query(sql, [productId], (error, results) => {
        if (error) {
            // Send a 500 status code if there is an error with the query
            res.status(500).send('Error fetching product data');
            return;
        }
        if (results.length === 0) {
            // Send a 404 status code if the product is not found
            res.status(404).send('Product not found');
            return;
        }
        // Send the product information including ImageFile as a JSON response
        res.json(results[0]);
    });
});



//fetching ALL img files
app.get('/api/allparts', (req, res) => {
    // Fetch the first 10 parts from partInfo table
    db.query('SELECT * FROM parts limit 10', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
