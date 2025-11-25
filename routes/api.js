'use strict';

module.exports = function (app) {
  
  let issuesDB = []; // Base de datos en memoria

  app.route('/api/issues/:project')

    // ---------------------------
    // CREATE ISSUE (POST)
    // ---------------------------
    .post(function (req, res) {
      const project = req.params.project;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = '',
        status_text = ''
      } = req.body;

      // Validar campos requeridos
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: Math.random().toString(16).slice(2),
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      issuesDB.push(newIssue);

      res.json({
        _id: newIssue._id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: newIssue.created_on,
        updated_on: newIssue.updated_on,
        open: true
      });
    })

    // ---------------------------
    // GET ISSUES
    // ---------------------------
    .get(function (req, res) {
      const project = req.params.project;
      const filters = req.query;

      let results = issuesDB.filter(i => i.project === project);

      // Filtrar por query params
      Object.keys(filters).forEach(key => {
        results = results.filter(issue => String(issue[key]) === String(filters[key]));
      });

      res.json(results);
    })

    // ---------------------------
    // UPDATE ISSUE (PUT)
    // ---------------------------
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...fields } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.values(fields).every(v => !v)) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      const issue = issuesDB.find(i => i._id === _id && i.project === project);

      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }

      Object.keys(fields).forEach(key => {
        if (fields[key]) issue[key] = fields[key];
      });

      issue.updated_on = new Date();

      res.json({ result: 'successfully updated', _id });
    })

    // ---------------------------
    // DELETE ISSUE
    // ---------------------------
    .delete(function (req, res) {
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const index = issuesDB.findIndex(i => i._id === _id);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      issuesDB.splice(index, 1);

      res.json({ result: 'successfully deleted', _id });
    });

};
