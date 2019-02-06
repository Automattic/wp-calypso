/** @format */

module.exports = function( grunt ) {
	// configure tasks
	grunt.initConfig( {
		shell: {
			runTests: {
				command: function( browserSize, sauceConfig ) {
					// The run.sh script no longer supports this format with the switch to
					// magellan as the test runner.   For now just calling mocha directly
					// until Grunt can be replaced with magellan entirely (Issue 508)
					// return './run.sh -R -c -f -v -l ' + sauceConfig + ' -s ' + browserSize
					return `env BROWSERSIZE=${ browserSize } ./node_modules/.bin/mocha --NODE_CONFIG='{"failVisdiffs":"true","sauce":"true","sauceConfig":"${ sauceConfig }"}' -R spec-xunit-reporter specs-visdiff/ || echo true`;
				},
			},
		},

		concurrent: {
			all: {
				tasks: [
					'run_mobile_osx-firefox',
					'run_desktop_osx-firefox',
					'run_tablet_osx-firefox',
					'run_mobile_osx-chrome',
					'run_desktop_osx-chrome',
					'run_tablet_osx-chrome',
					'run_mobile_osx-safari',
					'run_desktop_osx-safari',
					'run_tablet_osx-safari',
					'run_desktop_win-ie11',
				],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
			notChrome: {
				tasks: [
					'run_mobile_osx-firefox',
					'run_desktop_osx-firefox',
					'run_tablet_osx-firefox',
					'run_mobile_osx-safari',
					'run_desktop_osx-safari',
					'run_tablet_osx-safari',
					'run_desktop_win-ie11',
				],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
			firefox: {
				tasks: [ 'run_mobile_osx-firefox', 'run_desktop_osx-firefox', 'run_tablet_osx-firefox' ],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
			chrome: {
				tasks: [ 'run_mobile_osx-chrome', 'run_desktop_osx-chrome', 'run_tablet_osx-chrome' ],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
			safari: {
				tasks: [ 'run_mobile_osx-safari', 'run_desktop_osx-safari', 'run_tablet_osx-safari' ],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
			ie11: {
				tasks: [ 'run_desktop_win-ie11' ],
				options: {
					limit: 3,
					logConcurrentOutput: true,
				},
			},
		},
	} );

	// load tasks
	grunt.loadNpmTasks( 'grunt-concurrent' );
	grunt.loadNpmTasks( 'grunt-shell' );

	// register tasks
	grunt.registerTask( 'default', [ 'concurrent:all' ] );
	grunt.registerTask( 'all', [ 'concurrent:all' ] );
	grunt.registerTask( 'notChrome', [ 'concurrent:notChrome' ] );
	grunt.registerTask( 'firefox', [ 'concurrent:firefox' ] );
	grunt.registerTask( 'chrome', [ 'concurrent:chrome' ] );
	grunt.registerTask( 'safari', [ 'concurrent:safari' ] );
	grunt.registerTask( 'ie11', [ 'concurrent:ie11' ] );

	grunt.registerTask( 'run_mobile_osx-chrome', [ 'shell:runTests:mobile:osx-chrome' ] );
	grunt.registerTask( 'run_desktop_osx-chrome', [ 'shell:runTests:desktop:osx-chrome' ] );
	grunt.registerTask( 'run_tablet_osx-chrome', [ 'shell:runTests:tablet:osx-chrome' ] );
	grunt.registerTask( 'run_mobile_osx-firefox', [ 'shell:runTests:mobile:osx-firefox' ] );
	grunt.registerTask( 'run_desktop_osx-firefox', [ 'shell:runTests:desktop:osx-firefox' ] );
	grunt.registerTask( 'run_tablet_osx-firefox', [ 'shell:runTests:tablet:osx-firefox' ] );
	grunt.registerTask( 'run_mobile_osx-safari', [ 'shell:runTests:mobile:osx-safari' ] );
	grunt.registerTask( 'run_desktop_osx-safari', [ 'shell:runTests:desktop:osx-safari' ] );
	grunt.registerTask( 'run_tablet_osx-safari', [ 'shell:runTests:tablet:osx-safari' ] );
	grunt.registerTask( 'run_desktop_win-ie11', [ 'shell:runTests:desktop:win-ie11' ] );
};
