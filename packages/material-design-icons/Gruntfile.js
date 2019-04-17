module.exports = function( grunt ) {
	grunt.loadNpmTasks( 'grunt-svgstore' );

	grunt.initConfig( {
		svgstore: {
			options: {
				prefix: 'icon-', // This will prefix each ID
				svg: {
					viewBox: '0 0 24 24',
					xmlns: 'http://www.w3.org/2000/svg',
				},
			},
			default: {
				files: {
					'svg-sprite/material-icons.svg': [ 'src/action/*.svg' ],
				},
			},
		},
	} );

	grunt.registerTask( 'default', [ 'svgstore' ] );
};
