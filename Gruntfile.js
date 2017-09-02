/*
 * ninejs grunt configuration file
 */
function exports(grunt) {
	'use strict';

	var stylusFiles = [ '**/*.styl', '!node_modules/**', '!ui/bootstrap/extension.styl' ],
		tsfiles = ['**/*.ts', '!node_modules/**/*.ts', '!**/*.d.ts'],
		Q = require('kew');

	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig({
		stylus:
		{
			files: stylusFiles,
			options:
			{
				urlfunc: 'embedurl', // use embedurl('test.png') in our code to trigger Data URI
				compress: true
			}
		},
		exec: {
			clientSideTs: (process.env.TS_COMPILER || "./node_modules/typescript/bin/tsc") + " -p ./client/tsconfig.json",
			defaultTs : (process.env.TS_COMPILER || "./node_modules/typescript/bin/tsc") + " -p ./tsconfig.json",
		},
		tsd: {

		},
		dts_bundle: {
			build: {
				options: {
					name: 'ninejs',
					main: 'ninejsAuth.d.ts',
					exclude: function (n, external) {
						return /*external || (n.indexOf('typings/') >= 0) ||*/ (n.indexOf('node_modules') >= 0);
					},
					prefix: '',
					externals: false,
					referenceExternals: true,
					verbose: false,
					removeSource: false
				}
			}
		},
		globaltsd: {
			options: {
				target: __dirname + '/ninejsAuth.ts',
				baseDir: __dirname,
				exclude: [
					'ninejs.d.ts',
					'ninejsAuth.d.ts',
					'typings',
					'node_modules'
				],
				references: [
					'./typings/node/node.d.ts'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-globaltsd');
	grunt.registerTask('tsd','Install TypeScript definitions', function() {
		var done = this.async(),
			command = 'node',
			path = require('path'),
			cliPath = path.resolve(__dirname, 'node_modules', 'tsd', 'build', 'cli.js');

		var childProcess = require('child_process'),
			defer = Q.defer();
		var tsdProcess = childProcess.spawn(command, [cliPath, 'install'], { stdio: 'inherit' });
		tsdProcess.on('exit', function(/*code*/) {
			defer.resolve();
		});
		defer.promise.then(function () {
			done();
		});
	});
	// Default task.
	grunt.registerTask('default', ['exec']);

}

module.exports = exports;