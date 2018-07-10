/**
 * Internal dependencies
 */
const LibraryExportDefaultPlugin = require( '../../' );

module.exports = {
	mode: 'development',
	context: __dirname,
	entry: {
		boo: './boo',
		foo: './foo',
	},
	output: {
		filename: 'build/[name].js',
		path: __dirname,
		library: [ 'wp', '[name]' ],
		libraryTarget: 'global',
	},
	plugins: [
		new LibraryExportDefaultPlugin( [ 'boo' ] ),
	],
};
