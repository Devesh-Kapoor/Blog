const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'UG003',
  password: 'Password',
  port: 5432,
});
client.connect();
 

// Sanitize
function sanitizeHTML(html) {
  const allowedTags = ['p', 'b', 'i', 'u', 'strong', 'em'];
  return html.replace(/<\/?([a-z]+)[^>]*>/gi, (tag) => {
    const tagName = tag.slice(1, -1).toLowerCase();
    return allowedTags.includes(tagName) ? tag : ''; // Keep allowed tags, remove others
  });
}
 
// Middleware to check session validity
function checkSession(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from('<script>alert("Invalid session. Please log in."); window.location.href = "/login";</script>'));
  } else {
    next();
  }
}
 
/* GET posts page */
router.get('/', checkSession, function(req, res, next) {
  client.query('SELECT * FROM user_posts', (err, result) => {
    if (err) {
      console.error('Error fetching posts:', err.stack);
      return next(err); // Pass to the error handler
    }
    const posts = result.rows;
    res.render('posts', { title: 'Group UG03 BLOG', posts: posts, userId: req.session.user ? req.session.user.id : null, csrfToken: req.csrfToken() });
  });
});
 
/* POST a new post */
router.post('/', checkSession, function(req, res, next) {
  const post = req.body.content;
  const userId = req.session.user.id;
  const title = req.body.title;
  const sanitizedPost = sanitizeHTML(post);
  const insert = `INSERT INTO "user_posts" (post, user_id, post_title) VALUES ($1, $2, $3)`;
  const values = [sanitizedPost, userId, title];
  client.query(insert, values, (err, result) => {
    if (err) {
      console.error('Error creating post:', err.stack);
      return next(err); // Pass to the error handler
    }
    console.log('Post added');
    res.redirect('/posts');
  });
});
 
/* Delete a post */
router.post('/delete', checkSession, function(req, res, next) {
  const postId = req.body.Post_ID;
  const userId = req.session.user ? req.session.user.id : null;
 
  // Check if postId and userId are valid
  if (!postId || isNaN(postId) || !userId) {
    console.error('Invalid post ID or user not authenticated');
    return res.status(400).send('Invalid post ID or user not authenticated');
  }
 
  const del = `DELETE FROM "user_posts" WHERE "Post_ID" = $1 AND user_id = $2`;
  const values = [postId, userId];
 
  client.query(del, values, (err, result) => {
    if (err) {
      console.error('Error deleting post:', err.stack);
      return next(err); // Pass the error to the error handler middleware
    }
 
    if (result.rowCount === 0) {
      console.log('No post found to delete');
      return res.status(404).send('Post not found or not authorized');
    }
 
    console.log('Post deleted');
    res.redirect('/posts');
  });
});
 
/* POST search posts */
router.post('/search', checkSession, function(req, res, next) {
  const searchTerm = `%${req.body.search}%`;
  const sanitizedSearch = sanitizeHTML(searchTerm);
  const searchQuery = `SELECT * FROM user_posts WHERE post_title ILIKE $1 OR post ILIKE $1`;
  const values = [sanitizedSearch];
  client.query(searchQuery, values, (err, result) => {
    if (err) {
      console.error('Error searching posts:', err.stack);
      return next(err); // Pass to the error handler
    }
    const posts = result.rows;
    res.render('posts', { title: 'Group UG03 BLOG', posts: posts, userId: req.session.user.id, csrfToken: req.csrfToken() });
  });
});
 
/* Display edit form for a post */
router.get('/edit/:id', checkSession, function(req, res, next) {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const query = `SELECT * FROM "user_posts" WHERE "Post_ID" = $1 AND user_id = $2`;
  const values = [postId, userId];
 
  client.query(query, values, (err, result) => {
    if (err) {
      console.error('Error fetching post:', err.stack);
      return next(err); // Pass the error to the error handler middleware
    }
 
    if (result.rows.length === 0) {
      return res.status(404).send('Post not found or not authorized');
    }
 
    const post = result.rows[0];
    res.render('edit', { title: 'Group UG03 BLOG', post: post, csrfToken: req.csrfToken() });
  });
});
 
/* Handle post update */
router.post('/edit/:id', checkSession, function(req, res, next) {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const newTitle = req.body.title;
  const newContent = req.body.content;
 
  const updateQuery = `UPDATE "user_posts" SET post_title = $1, post = $2 WHERE "Post_ID" = $3 AND user_id = $4`;
  const values = [newTitle, newContent, postId, userId];
 
  client.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error('Error updating post:', err.stack);
      return next(err); // Pass the error to the error handler middleware
    }
 
    if (result.rowCount === 0) {
      return res.status(404).send('Post not found or not authorized');
    }
 
    res.redirect('/posts');
  });
});
 
module.exports = router;