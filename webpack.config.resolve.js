/* eslint-disable import/no-commonjs */

const path = require( 'path' );

const clientConfig = {
	extensions: [ '', '.json', '.js', '.jsx' ],
	root: [ path.join( __dirname, 'client' ), path.join( __dirname, 'client', 'extensions' ) ],
	modulesDirectories: [ 'node_modules' ],
	alias: {
		'react-virtualized': 'react-virtualized/dist/commonjs',
		'social-logos/example': 'social-logos/build/example'
	}
};

const serverConfig = {
	extensions: [ '', '.json', '.js', '.jsx' ],
	root: [ path.join( __dirname, 'server' ), path.join( __dirname, 'client' ), __dirname ],
	modulesDirectories: [ 'node_modules' ]
};

module.exports = {
	client: clientConfig,
	server: serverConfig,
};
