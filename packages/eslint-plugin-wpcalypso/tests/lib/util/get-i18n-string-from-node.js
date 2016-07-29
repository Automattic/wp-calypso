/**
 * @fileoverview Utility for retrieving callee identifier node from a CallExpression
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

var assert = require( 'assert' );
var getStringFromNode = require( '../../../lib/util/get-i18n-string-from-node.js' );
var config = require( '../../../.eslintrc.json' );
var parser = require( config.parser );

function getTranslatableStringsFromCode( code ) {
	var programNode = parser.parse( code, config.env );
	// Espree thinks it's parsing a whole program, so we just need to peel away
	// the 'Program' packaging.
	var stringNode = programNode.body[ 0 ].expression;
	return getStringFromNode( stringNode );
}

describe( '#getStringFromNode', function() {
	it( 'should return simple strings', function() {
		assert.equal( 'a simple string', getTranslatableStringsFromCode( "'a simple string'" ) );
	} );

	it( 'should return concatentated strings', function() {
		assert.equal( 'A string in two parts', getTranslatableStringsFromCode( '"A string" + " in two parts"' ) );
	} );

	it( 'should return strings from template literals', function() {
		assert.equal( 'A template literal string', getTranslatableStringsFromCode( '`A template literal string`' ) );
	} );

	it( 'should handle different literal types', function() {
		assert.equal( 'A template and a string', getTranslatableStringsFromCode( '`A template` + " and a string"' ) );
	} );
} );

