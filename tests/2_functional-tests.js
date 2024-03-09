// Include necessary libraries for HTTP assertions
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert; // Assertion library
const server = require('../server'); // Import server configuration
const ObjectId = require('mongoose').Types.ObjectId; // For generating valid MongoDB Object IDs

// Tell Chai to use the chaiHttp plugin
chai.use(chaiHttp);

// Define a suite of functional tests
suite('Functional Tests', function() {
  this.timeout(5000); // Set a custom timeout for asynchronous operations

  let createdIssueId; // Variable to store the _id of an issue created during tests

  // Tests related to POST requests on the '/api/issues/{project}' route
  suite('POST /api/issues/{project}', function() {
    // Test the creation of an issue with all fields provided
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/{project}') 
        .send({
          issue_title: 'Issue with every field',
          issue_text: 'Text for issue with every field',
          created_by: 'Tester',
          assigned_to: 'Assignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Check if the response status is 200
          assert.property(res.body, '_id'); // Ensure response body contains '_id'
          createdIssueId = res.body._id; // Save '_id' for use in subsequent tests
          done(); // Signal completion of the test
        });
    });

    // Test the creation of an issue with only required fields
    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/{project}')
        .send({
          issue_title: 'Issue with only required fields',
          issue_text: 'Text for issue with only required fields',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Response status check
          done();
        });
    });

    // Test the creation of an issue with missing required fields
    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/{project}')
        .send({
          issue_title: 'Missing fields'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Response status check
          done();
        });
    });
  });

  // Tests related to GET requests on the '/api/issues/{project}' route
  suite('GET /api/issues/{project}', function() {
    // Test viewing issues on a project without filters
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/{project}') 
        .end(function(err, res) {
          assert.equal(res.status, 200); // Response status check
          assert.isArray(res.body); // Check if the response is an array
          done();
        });
    });

    // Test viewing issues on a project with a single filter
    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/{project}?created_by=Tester') 
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body); // Ensure the response is still an array
          done();
        });
    });

    // Test viewing issues on a project with multiple filters
    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/{project}?created_by=Tester&assigned_to=Assignee') 
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });

  // Tests related to PUT requests on the '/api/issues/{project}' route
  suite('PUT /api/issues/{project}', function() {
    // Test updating a single field on an issue
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/{project}')
        .send({
          _id: createdIssueId, // Use the _id stored from earlier test
          issue_text: 'Updated text' // Specify the field to update
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated'); // Check the update result
          done();
        });
    });

    // Test updating multiple fields on an issue
    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/{project}')
        .send({
          _id: createdIssueId, // Use the _id from a previous test
          issue_title: 'Updated title', // Multiple fields to update
          issue_text: 'Updated text again'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    // Test updating an issue with missing _id
    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/{project}')
        .send({
          issue_text: 'Missing ID' // Attempt to update without providing _id
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    // Test updating an issue with no fields to update specified
    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/{project}')
        .send({
          _id: createdIssueId, // Provide _id but no fields to update
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    // Test updating an issue with an invalid _id
    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/{project}')
        .send({
          _id: 'invalidId', // Use an invalid _id format
          issue_title: 'Invalid ID update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
  });

  // Tests related to DELETE requests on the '/api/issues/{project}' route
  suite('DELETE /api/issues/{project}', function() {
    // Test deleting an issue
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/{project}') 
        .send({
          _id: createdIssueId // Use the _id of an issue created in earlier tests
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted'); // Check delete result
          done();
        });
    });

    // Test deleting an issue with an invalid _id
    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/{project}')
        .send({
          _id: 'invalidId' // Attempt to delete using an invalid _id
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    // Test deleting an issue with missing _id
    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/{project}')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
