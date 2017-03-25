/* eslint-disable import/no-commonjs */

const path = require( 'path' );

module.exports = {
	extensions: [ '', '.json', '.js', '.jsx' ],
	root: [ path.join( __dirname, 'client' ), path.join( __dirname, 'client', 'extensions' ) ],
	modulesDirectories: [ 'node_modules' ],
	alias: {
		'react-virtualized': 'react-virtualized/dist/commonjs',
		'social-logos/example': 'social-logos/build/example'
	}
};
