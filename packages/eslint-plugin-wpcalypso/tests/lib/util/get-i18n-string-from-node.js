/**
 * @fileoverview Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

var assert = require( 'assert' );
var getTextContentFromNode = require( '../../../lib/util/get-text-content-from-node.js' );
var config = require( '../../../.eslintrc.json' );
var parser = require( config.parser );

function parseCode( code ) {
	var programNode = parser.parse( code, config.env );
	// Espree thinks it's parsing a whole program, so we just need to peel away
	// the 'Program' packaging.
	return programNode.body[ 0 ];
}
function parseExpressionStatement( code ) {
	var node = parseCode( code ).expression;
	return node;
}

describe( '#getStringFromNode', function() {
	it( 'should return simple strings', function() {
		assert.equal( 'a simple string', getTextContentFromNode( parseExpressionStatement( "'a simple string'" ) ) );
	} );

	it( 'should return concatentated strings', function() {
		assert.equal( 'A string in two parts', getTextContentFromNode( parseExpressionStatement( '"A string" + " in two parts"' ) ) );
	} );

	it( 'should return concatentated strings', function() {
		assert.equal( 'A string in three parts', getTextContentFromNode( parseExpressionStatement( '"A string" + " in " + "three parts"' ) ) );
	} );

	it( 'should return strings from template literals', function() {
		assert.equal( 'A template literal string', getTextContentFromNode( parseExpressionStatement( '`A template literal string`' ) ) );
	} );

	it( 'should handle different literal types', function() {
		assert.equal( 'A template and a string', getTextContentFromNode( parseExpressionStatement( '`A template` + " and a string"' ) ) );
	} );

	it( 'should return false for functions', function() {
		var functionNode = parseExpressionStatement( 'foo()' );

		assert.strictEqual( false, getTextContentFromNode( functionNode ) );
	} );

	it( 'should return false for variable assignments', function() {
		var variableDeclarationNode = parseCode( "var aVariable = 'a string to assign';" );
		var variableDeclarator = variableDeclarationNode.declarations[ 0 ];

		assert.strictEqual( false, getTextContentFromNode( variableDeclarationNode ) );
		assert.strictEqual( false, getTextContentFromNode( variableDeclarator ) );
	} );

	it( 'should return false for a binary structure including invalid node types', function() {
		assert.strictEqual( false, getTextContentFromNode( parseExpressionStatement( "'a string plus a function' + foo()" ) ) );
	} );
} );

