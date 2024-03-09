'use strict';

// Require mongoose to interact with MongoDB
const mongoose = require('mongoose');
// Connect to MongoDB using the URI provided in environment variables
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for issues with required fields and defaults
const issueSchema = new mongoose.Schema({
  project: { type: String, required: true }, // Project name, required
  issue_title: { type: String, required: true }, // Title of the issue, required
  issue_text: { type: String, required: true }, // Description of the issue, required
  created_by: { type: String, required: true }, // Creator of the issue, required
  assigned_to: { type: String, default: '' }, // Who the issue is assigned to, optional
  status_text: { type: String, default: '' }, // Status text of the issue, optional
  open: { type: Boolean, default: true }, // Whether the issue is open, default true
  created_on: { type: Date, default: Date.now }, // When the issue was created, default now
  updated_on: { type: Date, default: Date.now } // When the issue was last updated, default now
});

// Create a model from the schema
const Issue = mongoose.model('Issue', issueSchema);

// Export the function that defines routes
module.exports = function(app) {

  app.route('/api/issues/:project')

    // Handle GET requests for issues
    .get(function(req, res) {
      let project = req.params.project; // Get the project name from URL parameter
      // Find issues by project name and any query parameters, excluding MongoDB version key
      Issue.find({ project: project, ...req.query }, '-__v', (err, issues) => {
        res.json(issues); // Respond with the found issues
      });
    })

    // Handle POST requests to create new issues
    .post(function(req, res) {
      const project = req.params.project; // Get the project name from URL parameter
      // Destructure request body to get issue fields
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      // If any required field is missing, return an error
      if (!issue_title || !issue_text || !created_by) {
        return res.status(200).json({ error: 'required field(s) missing' });
      }

      // Create a new issue using the model
      const newIssue = new Issue({
        project, issue_title, issue_text, created_by, assigned_to, status_text
      });

      // Save the new issue to the database
      newIssue.save((err, issue) => {
        res.json(issue); // Respond with the created issue
      });
    })

    // Handle PUT requests to update issues
    .put(function(req, res) {
      const { _id } = req.body; // Get _id from request body
      // If _id is missing, return an error
      if (!_id) {
        return res.status(200).json({ error: 'missing _id' });
      }

      // Copy request body to updates, excluding _id
      const updates = { ...req.body };
      delete updates._id; 

      // Check if there are any fields to update
      if (Object.keys(updates).filter(key => updates[key] !== '').length === 0) {
        return res.status(200).json({ error: 'no update field(s) sent', '_id': _id });
      }

      updates.updated_on = new Date(); // Update the updated_on field to now

      // Find the issue by _id and update it with new values
      Issue.findByIdAndUpdate(_id, { $set: updates }, { new: true }, (err, updatedIssue) => {
        if (!updatedIssue) {
          return res.status(200).json({ error: 'could not update', '_id': _id });
        }
        res.json({ result: 'successfully updated', '_id': _id });
      });
    })

    // Handle DELETE requests to remove issues
    .delete(function(req, res) {
      const { _id } = req.body; // Get _id from request body
      // If _id is missing, return an error
      if (!_id) {
        return res.status(200).json({ error: 'missing _id' });
      }

      // Find the issue by _id and remove it
      Issue.findByIdAndRemove(_id, (err, issue) => {
        if (!issue) {
          return res.status(200).json({ error: 'could not delete', '_id': _id });
        }
        res.json({ result: 'successfully deleted', '_id': _id });
      });
    });
};
