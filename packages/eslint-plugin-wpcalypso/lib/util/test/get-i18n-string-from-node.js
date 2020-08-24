/**
 * @file Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

const assert = require( 'assert' );
const getTextContentFromNode = require( '../../../lib/util/get-text-content-from-node.js' );
const parser = require( 'babel-eslint' );

function parseCode( code ) {
	const programNode = parser.parse( code );
	// Espree thinks it's parsing a whole program, so we just need to peel away
	// the 'Program' packaging.
	return programNode.body[ 0 ];
}
function parseExpressionStatement( code ) {
	const node = parseCode( code ).expression;
	return node;
}

describe( '#getStringFromNode', function () {
	it( 'should return simple strings', function () {
		assert.equal(
			'a simple string',
			getTextContentFromNode( parseExpressionStatement( "'a simple string'" ) )
		);
	} );

	it( 'should return concatentated strings', function () {
		assert.equal(
			'A string in two parts',
			getTextContentFromNode( parseExpressionStatement( '"A string" + " in two parts"' ) )
		);
	} );

	it( 'should return more concatentated strings', function () {
		assert.equal(
			'A string in three parts',
			getTextContentFromNode( parseExpressionStatement( '"A string" + " in " + "three parts"' ) )
		);
	} );

	it( 'should return strings from template literals', function () {
		assert.equal(
			'A template literal string',
			getTextContentFromNode( parseExpressionStatement( '`A template literal string`' ) )
		);
	} );

	it( 'should handle different literal types', function () {
		assert.equal(
			'A template and a string',
			getTextContentFromNode( parseExpressionStatement( '`A template` + " and a string"' ) )
		);
	} );

	it( 'should return false for functions', function () {
		const functionNode = parseExpressionStatement( 'foo()' );

		assert.strictEqual( false, getTextContentFromNode( functionNode ) );
	} );

	it( 'should return false for variable assignments', function () {
		const variableDeclarationNode = parseCode( "var aVariable = 'a string to assign';" );
		const variableDeclarator = variableDeclarationNode.declarations[ 0 ];

		assert.strictEqual( false, getTextContentFromNode( variableDeclarationNode ) );
		assert.strictEqual( false, getTextContentFromNode( variableDeclarator ) );
	} );

	it( 'should return false for a binary structure including invalid node types', function () {
		assert.strictEqual(
			false,
			getTextContentFromNode( parseExpressionStatement( "'a string plus a function' + foo()" ) )
		);
	} );
} );
