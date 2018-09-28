module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		express: {
			options: {
				background: true
				// Override defaults here
			},
			dev: {
				options: {
					script: 'server.js',
					node_env: 'dev'
				}
			}
		},
		watch: {
			express: {
				files: ['*.js','*.json','lib/**/*.js','lib/**/*.json','!**.swp'],
				tasks: ['express:dev'],
				options: {spawn: false}

			}
		}
	});

	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('server',['express:dev','watch']);
};