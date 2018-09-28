/*
	Some core unit tests. These do not cover all cases.
 */
const rp = require('request-promise-native');
const _ = require('underscore');
const uuidv4 = require('uuid/v4');

describe('I', function() {
	var userId = uuidv4();
	var base_url = 'http://localhost:3000/courses';

	function store_session(courseId,sessionId,session_stats){
		return rp({
			uri: `${base_url}/${courseId}`,
			headers: {
				'X-User-Id': userId
			},
			method: 'POST',
			body: _.extend({sessionId},session_stats),
			json: true,
			resolveWithFullResponse: true
		});
	}

	beforeEach(function(){
		this.courseId = uuidv4();
		this.sessionId = uuidv4();
		this.session_stats = {
			sessionId: this.sessionId,
			totalModulesStudied: 1,
			averageScore: 2,
			timeStudied: 3600000
		};

	});

	it('should not be able to make a call without or with an invalid userId', async function() {
		try {
			let res = await rp({
				uri: `${base_url}/`,
				resolveWithFullResponse: true
			});
			fail('Succeeded to store session without userId');
		} catch (e) {
			expect(e.statusCode).toEqual(400);
		}
	});

	it('should be able to store a session study event', async function() {

		let res = await store_session(this.courseId,this.sessionId,this.session_stats);
		expect(res.statusCode).toEqual(201);
	});

	it('should be able to fetch a single study session', async function(){
		await store_session(this.courseId,this.sessionId,this.session_stats);
		let res = await rp({
			uri: `${base_url}/${this.courseId}/sessions/${this.sessionId}`,
			headers: {
				'X-User-Id': userId
			},
			json: true,
			resolveWithFullResponse: true
		});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual(this.session_stats);
	});

	it('should be able to fetch course lifetime statistics', async function() {
		let sessionId = uuidv4();
		let second_session = {
			sessionId: sessionId,
			totalModulesStudied: 3,
			averageScore: 4,
			timeStudied: 3600000
		};

		await store_session(this.courseId,this.sessionId,this.session_stats);
		await store_session(this.courseId,sessionId,second_session);

		let res = await rp({
			uri: `${base_url}/${this.courseId}`,
			headers: {
				'X-User-Id': userId
			},
			json: true,
			resolveWithFullResponse: true
		});

		expect(res.statusCode).toEqual(200);

		let aggr = {
			totalModulesStudied: this.session_stats.totalModulesStudied + second_session.totalModulesStudied,
			averageScore: (this.session_stats.averageScore + second_session.averageScore)/2,
			timeStudied: this.session_stats.timeStudied + second_session.timeStudied
		};

		expect(res.body).toEqual(aggr);
	});

});