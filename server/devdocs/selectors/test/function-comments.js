/**
 * External dependencies
 */
import espree from 'espree';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { findOutermostNode, getComment } from '../function-comments';

const name = 'foo';
const sentinel = '12345';
const comment = `/*${ sentinel }*/`;
const code = s => `${ comment }\n${ s }`;

const ast = contents => espree.parse( contents, {
	attachComment: true,
	ecmaVersion: 6,
	sourceType: 'module',
	ecmaFeatures: {
		experimentalObjectRestSpread: true,
	}
} );

const parse = s => findOutermostNode( ast( code( s ) ), name );

const pass = s => expect( getComment( parse( s ) ) ).to.equal( sentinel, s );
const fail = s => expect( parse( s ) ).to.be.null;

describe( 'findOutermostNode', () => {
	it( 'should handle function declarations', () => {
		pass( `function ${ name }() {}` );
	} );

	it( 'should handle function variable declarations', () => {
		pass( `var ${ name } = function() {}` );
		pass( `let ${ name } = function() {}` );
		pass( `const ${ name } = function() {}` );
		pass( `const ${ name } = function ${ name }() {}` );
	} );

	it( 'should handle arrow function variable declarations', () => {
		pass( `var ${ name } = () => {}` );
		pass( `let ${ name } = () => {}` );
		pass( `const ${ name } = () => {}` );
	} );

	it( 'should handle partially-applied function declarations', () => {
		pass( `const ${ name } = helper()` );
	} );

	it( 'should reject non-function variable declarations', () => {
		fail( `var ${ name } = 14` );
		fail( `var ${ name } = condition ? ifTrue : ifFalse` );
	} );

	it( 'should handle function exports', () => {
		pass( `export function ${ name }() {}` );
	} );

	it( 'should handle function variable exports', () => {
		pass( `export const ${ name } = function() {}` );
		pass( `export const ${ name } = function ${ name }() {}` );
	} );

	it( 'should handle arrow function variable exports', () => {
		pass( `export const ${ name } = () => {}` );
	} );

	it( 'should reject non-function exports', () => {
		fail( `export const ${ name } = 14` );
		fail( `export const ${ name } = curried()` );
		fail( `export const ${ name } = condition ? ifTrue : ifFalse` );
	} );
} );
