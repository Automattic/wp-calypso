/* eslint-disable no-var */

var esprima = require( 'esprima' ),
	estraverse = require( 'estraverse' ),
	escodegen = require( 'escodegen' ),
	debug = console.log.bind( console );
	//debug = require( 'debug' )( 'calypso:async-loader' );

/*
 * A cheaper heuristics to avoid parsing every file hit.
 */
function requiresAsyncLoad( content ) {
	return -1 !== content.indexOf( 'components/async-load' );
}

function replaceAsyncLoadCalls( content, filePath ) {
	var ast = esprima.parse( content ),
		found,
		requestedPath;

	ast = estraverse.replace( ast, {
		enter: function( node, parent ) {
			requestedPath = getRequireString( node, parent );
			if ( requestedPath ) {
				debug( requestedPath, 'found in', filePath );
				found = true;
				return Object.assign( {}, node, {
					value: makeRequireFunction( requestedPath )
				} );
			}
		},
	} );

	if ( ! found ) {
		return content;
	}

	return escodegen.generate( ast );
}

/*
 * Looks for `require: 'foo'` in any object.
 *
 * This includes transpiled JSX, e.g. <Foo require="foo" />
 *
 * TODO: make sure this only applies to AsyncLoad calls?
 */
function getRequireString( node ) {
	return node.type === 'Property' &&
		node.key &&
		node.key.type === 'Identifier' &&
		node.key.name === 'require' &&
		node.value.type === 'Literal' &&
		node.value.value;
}

function makeRequireFunction( requirePath ) {
	return {
		type: 'FunctionExpression',
		id: null,
		params: [
			{
				type: 'Identifier',
				name: 'callback'
			}
		],
		defaults: [],
		body: {
			type: 'BlockStatement',
			body: [
				{
					type: 'ExpressionStatement',
					expression: {
						type: 'CallExpression',
						callee: {
							type: 'Identifier',
							name: 'require'
						},
						arguments: [
							{
								type: 'ArrayExpression',
								elements: [
									{
										type: 'Literal',
										value: requirePath,
										raw: '\'' + requirePath + '\''
									}
								]
							},
							{
								type: 'Identifier',
								name: 'callback'
							}
						]
					}
				}
			]
		},
		generator: false,
		expression: false
	};
}

//function getIdentifier( node, parent ) {
//	return node.type === 'CallExpression' &&
//		node.callee &&
//		node.callee.type === 'Identifier' &&
//		node.callee.name === 'require' &&
//		node.arguments &&
//		node.arguments[ 0 ] &&
//		node.arguments[ 0 ].type === 'Literal' &&
//		node.arguments[ 0 ].value === 'components/async-load' &&
//		parent.id &&
//		parent.id.type === 'Identifier' &&
//		parent.id.name;
//}
//
//function isAsyncLoad( name, node ) {
//	return node.expression &&
//		node.expression.arguments &&
//		node.expression.arguments[ 0 ] &&
//		node.expression.arguments[ 0 ].type === 'Identifier' &&
//		node.expression.arguments[ 0 ].name === name;
//}

module.exports = function( content ) {
	this.cacheable && this.cacheable();

	debug( 'generation:', this.resourcePath );

	return requiresAsyncLoad( content )
		? replaceAsyncLoadCalls( content, this.resourcePath )
		: content;
};
