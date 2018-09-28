/*
	Mock DB with async calls to enable easy integration with an actual DB.
 */

'use strict';

const _ = require('underscore');

var store = {
	// table of users containing courses and sessions data
	user_stats: {}
};

// user: { courses: { sessions: { } } }

const DB = module.exports = {};

/*
	Store session stats for a given user and course

	@param {uuid} userId
	@param {uuid} courseId
	@param {Object} o - session meta data and stats
	@param {uuid} o.sessionId
	@param {Number} o.totalModulesStudied
	@param {Number} o.averageScore
	@param {Number} o.timeStudied
 */
DB.store_session_stats = function(userId,courseId,o) {
	let u = store.user_stats[userId] || ( store.user_stats[userId] = { courses:{} } );
	let c = u.courses[courseId]      || ( u.courses[courseId] = { sessions:{} } );

	return new Promise((resolve,reject)=>{
		c.sessions[o.sessionId] = o;
		resolve();
	});
}

/*
	Retrieve lifetime course stats for a given user

	@param {uuid} userId
	@param {uuid} courseId
 */
DB.get_course_stats = function(userId,courseId) {
	return new Promise((resolve,reject)=>{
		let u = store.user_stats[userId];
		if ( !u ) return resolve(null);

		let c = u.courses[courseId];
		if ( !c ) return resolve(null);

		let aggr = Object.values(c.sessions).reduce((d,o)=>{
			['totalModulesStudied','averageScore','timeStudied'].forEach((p)=>{
				d[p] += o[p];
			});

			return d;
		},{ totalModulesStudied:0, averageScore:0, timeStudied:0 });

		aggr.averageScore /= Object.keys(c.sessions).length;

		return resolve(aggr);
	});
}

/*
	Retrieve session stats for a given user and course

	@param {uuid} userId
	@param {uuid} courseId
	@param {uuid} sessionId
 */
DB.get_session_stats = function(userId,courseId,sessionId) {
	return new Promise((resolve,reject)=>{
		let u = store.user_stats[userId];
		if ( !u ) return resolve(null);

		let c = u.courses[courseId];
		if ( !c ) return resolve(null);

		return resolve(c.sessions[sessionId]);
	});
};