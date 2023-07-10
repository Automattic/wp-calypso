const createTransformer = require( 'babel-jest' ).default.createTransformer;

module.exports = createTransformer( {
	presets: [ '@wordpress/babel-preset-default', '@babel/preset-typescript' ],
} );
