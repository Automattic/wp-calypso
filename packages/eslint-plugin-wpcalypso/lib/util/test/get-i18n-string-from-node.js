/**
 * @file Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

const parser = require( '@babel/eslint-parser' );
const getTextContentFromNode = require( '../../../lib/util/get-text-content-from-node.js' );

function parseCode( code ) {
	const programNode = parser.parse( code, {
		requireConfigFile: false,
		babelOptions: { configFile: false },
	} );
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
		const result = getTextContentFromNode( parseExpressionStatement( "'a simple string'" ) );
		expect( result ).toEqual( 'a simple string' );
	} );

	it( 'should return concatentated strings', function () {
		const result = getTextContentFromNode(
			parseExpressionStatement( '"A string" + " in two parts"' )
		);
		expect( result ).toEqual( 'A string in two parts' );
	} );

	it( 'should return more concatentated strings', function () {
		const result = getTextContentFromNode(
			parseExpressionStatement( '"A string" + " in " + "three parts"' )
		);
		expect( result ).toEqual( 'A string in three parts' );
	} );

	it( 'should return strings from template literals', function () {
		const result = getTextContentFromNode(
			parseExpressionStatement( '`A template literal string`' )
		);
		expect( result ).toEqual( 'A template literal string' );
	} );

	it( 'should handle different literal types', function () {
		const result = getTextContentFromNode(
			parseExpressionStatement( '`A template` + " and a string"' )
		);
		expect( result ).toEqual( 'A template and a string' );
	} );

	it( 'should return false for functions', function () {
		const functionNode = parseExpressionStatement( 'foo()' );

		expect( getTextContentFromNode( functionNode ) ).toStrictEqual( false );
	} );

	it( 'should return false for variable assignments', function () {
		const variableDeclarationNode = parseCode( "var aVariable = 'a string to assign';" );
		const variableDeclarator = variableDeclarationNode.declarations[ 0 ];

		expect( getTextContentFromNode( variableDeclarationNode ) ).toStrictEqual( false );
		expect( getTextContentFromNode( variableDeclarator ) ).toStrictEqual( false );
	} );

	it( 'should return false for a binary structure including invalid node types', function () {
		const result = getTextContentFromNode(
			parseExpressionStatement( "'a string plus a function' + foo()" )
		);
		expect( result ).toStrictEqual( false );
	} );
} );
