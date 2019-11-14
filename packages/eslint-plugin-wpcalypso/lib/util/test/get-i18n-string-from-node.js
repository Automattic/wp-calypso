/**
 * @fileoverview Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
const getTextContentFromNode = require( '../../../lib/util/get-text-content-from-node.js' );
// eslint-disable-next-line import/no-extraneous-dependencies
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

describe( '#getStringFromNode', () => {
	test( 'should return simple strings', () => {
		expect( getTextContentFromNode( parseExpressionStatement( "'a simple string'" ) ) ).toBe(
			'a simple string'
		);
	} );

	test( 'should return concatentated strings', () => {
		expect(
			getTextContentFromNode( parseExpressionStatement( '"A string" + " in two parts"' ) )
		).toBe( 'A string in two parts' );
	} );

	test( 'should return more concatentated strings', () => {
		expect(
			getTextContentFromNode( parseExpressionStatement( '"A string" + " in " + "three parts"' ) )
		).toBe( 'A string in three parts' );
	} );

	test( 'should return strings from template literals', () => {
		expect(
			getTextContentFromNode( parseExpressionStatement( '`A template literal string`' ) )
		).toBe( 'A template literal string' );
	} );

	test( 'should handle different literal types', () => {
		expect(
			getTextContentFromNode( parseExpressionStatement( '`A template` + " and a string"' ) )
		).toBe( 'A template and a string' );
	} );

	test( 'should return false for functions', () => {
		const functionNode = parseExpressionStatement( 'foo()' );
		expect( getTextContentFromNode( functionNode ) ).toBe( false );
	} );

	test( 'should return false for variable assignments', () => {
		const variableDeclarationNode = parseCode( "var aVariable = 'a string to assign';" );
		const variableDeclarator = variableDeclarationNode.declarations[ 0 ];

		expect( getTextContentFromNode( variableDeclarationNode ) ).toBe( false );
		expect( getTextContentFromNode( variableDeclarator ) ).toBe( false );
	} );

	test( 'should return false for a binary structure including invalid node types', () => {
		expect(
			getTextContentFromNode( parseExpressionStatement( "'a string plus a function' + foo()" ) )
		).toBe( false );
	} );
} );
