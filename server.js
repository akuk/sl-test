'use strict;'

// !! use import instead of require
const express = require('express');
const body_parser = require('body-parser');
const R = require('express-promise-router')();
const _ = require('underscore');
const morgan = require('morgan');

const DB = require('./db');
const validate = require('./schema_validation');

//-- Config
const PORT = process.env.port || 3000;

var app = express();

app.use(body_parser.json({limit:'10mb'}));
app.use(morgan('combined'));

app.use((req,res,next)=>{
	validate('userId', req.get('X-User-Id'));
	next();
});


//-- Api calls

/*
	Test : curl -v -X GET http://localhost:3000/
*/
R.get('/',(req,res)=>{
	return new Promise((resolve,reject)=>{
		resolve(res.status(200).send('Hello! It works.'));
	});
});

/*
	Persists a session study event

	Test : curl -v -X POST -H "X-User-Id: 429b463f-aa82-424e-be4f-560bfe0a9593" -H "Content-type: application/json" -d '{"sessionId":"bc5200fe-f82f-4a56-a30b-7e12a662d069","totalModulesStudied":1,"averageScore":2,"timeStudied":3600000}' http://localhost:3000/courses/bae80f66-032b-4912-aca0-c672a5365956

*/
R.post('/courses/:courseId',(req,res)=>{

	var userId = req.get('X-User-Id');
	var courseId = req.params.courseId;

	validate('courseId',courseId);
	validate('session_stats',req.body);

	return DB.store_session_stats(userId,courseId,req.body)
	.then(()=>{
		return res.status(201).end();
	});
});

/*
	Fetches course lifetime statistics

	Test : curl -v -X GET -H "X-User-Id: 429b463f-aa82-424e-be4f-560bfe0a9593" http://localhost:3000/courses/bae80f66-032b-4912-aca0-c672a5365956
*/
R.get('/courses/:courseId',(req,res)=>{
	var userId = req.get('X-User-Id');
	var courseId = req.params.courseId;

	validate('courseId',courseId);

	return DB.get_course_stats(userId,courseId)
	.then((stats)=>{

		// this should be extended to throw an error for explaining why stats were not found, i.e. unknown userId/courseId
		if ( stats === null ) return res.status(500).end();

		return res.status(200).send(stats);
	});
});

/*
	Fetches a single study session

	Test : curl -v -X GET -H "X-User-Id: 429b463f-aa82-424e-be4f-560bfe0a9593" http://localhost:3000/courses/bae80f66-032b-4912-aca0-c672a5365956/sessions/bc5200fe-f82f-4a56-a30b-7e12a662d069
 */
R.get('/courses/:courseId/sessions/:sessionId',(req,res)=>{
	var userId = req.get('X-User-Id');
	var courseId = req.params.courseId;
	var sessionId = req.params.sessionId;

	validate('courseId',courseId);
	validate('sessionId',sessionId);

	return DB.get_session_stats(userId,courseId,sessionId)
	.then((stats)=>{
		if ( stats === null ) return res.status(500).end();
		return res.status(200).send(stats);
	});
});

app.use(R);

//-- Handle errors
app.use((err,req,res,next)=>{
	console.log('!! Error',err.stack || err);

	return res.status(400).end(err);
});


//-- Start server
var server = require('http').createServer(app);

server.listen(PORT,()=>{
	var addr = server.address().address;
	var port = server.address().port;
	console.log('** Server started %s:%d',addr,port);
})
.on('error',(err)=>{
	console.log('!! Server got error:',err);
	process.exit(1);
});
