const chai = require('chai');
let assert = chai.assert;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  this.timeout(5000);

  const project = 'apitest';
  let issueId1;
  let issueId2;

  // 1) Create an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Issue completo',
        issue_text: 'Texto de issue completo',
        created_by: 'Kevin',
        assigned_to: 'Dev',
        status_text: 'En progreso'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Issue completo');
        assert.equal(res.body.issue_text, 'Texto de issue completo');
        assert.equal(res.body.created_by, 'Kevin');
        assert.equal(res.body.assigned_to, 'Dev');
        assert.equal(res.body.status_text, 'En progreso');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.isTrue(res.body.open);
        issueId1 = res.body._id;
        done();
      });
  });

  // 2) Create an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Solo requeridos',
        issue_text: 'Texto solo requerido',
        created_by: 'Kevin'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Solo requeridos');
        assert.equal(res.body.issue_text, 'Texto solo requerido');
        assert.equal(res.body.created_by, 'Kevin');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.isTrue(res.body.open);
        issueId2 = res.body._id;
        done();
      });
  });

  // 3) Create an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + project)
      .send({
        // faltan issue_text y created_by
        issue_title: 'Faltan campos'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  // 4) View issues on a project
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + project)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2);
        const issue = res.body[0];
        assert.property(issue, '_id');
        assert.property(issue, 'issue_title');
        assert.property(issue, 'issue_text');
        assert.property(issue, 'created_by');
        assert.property(issue, 'assigned_to');
        assert.property(issue, 'status_text');
        assert.property(issue, 'created_on');
        assert.property(issue, 'updated_on');
        assert.property(issue, 'open');
        done();
      });
  });

  // 5) View issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + project)
      .query({ open: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  // 6) View issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + project)
      .query({ open: true, created_by: 'Kevin' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
          assert.equal(issue.created_by, 'Kevin');
        });
        done();
      });
  });

  // 7) Update one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId1,
        issue_text: 'Texto actualizado'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: issueId1
        });
        done();
      });
  });

  // 8) Update multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId2,
        issue_title: 'Título actualizado',
        open: false
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: issueId2
        });
        done();
      });
  });

  // 9) Update an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + project)
      .send({
        issue_text: 'Sin _id'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // 10) Update an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId1
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'no update field(s) sent',
          _id: issueId1
        });
        done();
      });
  });

  // 11) Update an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    const fakeId = '1234567890abcdef12345678';
    chai
      .request(server)
      .put('/api/issues/' + project)
      .send({
        _id: fakeId,
        issue_title: 'No debería actualizar'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not update',
          _id: fakeId
        });
        done();
      });
  });

  // 12) Delete an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/' + project)
      .send({
        _id: issueId2
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully deleted',
          _id: issueId2
        });
        done();
      });
  });

  // 13) Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    const fakeId = 'invalididhere12345';
    chai
      .request(server)
      .delete('/api/issues/' + project)
      .send({
        _id: fakeId
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not delete',
          _id: fakeId
        });
        done();
      });
  });

  // 14) Delete an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/' + project)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

});
