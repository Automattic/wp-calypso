/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal dependencies
 */
import decodeEntitiesNode from '../decode-entities/node';

describe( 'formatting', () => {
	let formatting, capitalPDangit, parseHtml, decodeEntitiesBrowser, preventWidows;

	beforeAll( () => {
		formatting = require( '../' );
		capitalPDangit = formatting.capitalPDangit;
		parseHtml = formatting.parseHtml;
		decodeEntitiesBrowser = require( '../decode-entities/browser' );
		preventWidows = formatting.preventWidows;
	} );

	describe( '#capitalPDangtest()', function() {
		test( 'should error when input is not a string', function() {
			const types = [ {}, undefined, 1, true, [], function() {} ];

			types.forEach( function( type ) {
				chai
					.expect( function() {
						capitalPDangit( type );
					} )
					.to.throw( Error );
			} );
		} );

		test( 'should not modify wordpress', function() {
			const strings = [ 'wordpress', 'I love wordpress' ];

			strings.forEach( function( string ) {
				chai.assert.equal( capitalPDangit( string ), string );
			} );
		} );

		test( 'should return WordPress with a capital P when passed Wordpress', function() {
			chai.assert.equal( capitalPDangit( 'Wordpress' ), 'WordPress' );
			chai.assert.equal( capitalPDangit( 'I love Wordpress' ), 'I love WordPress' );
		} );

		test( 'should replace all instances of Wordpress', function() {
			chai.assert.equal( capitalPDangit( 'Wordpress Wordpress' ), 'WordPress WordPress' );
			chai.assert.equal(
				capitalPDangit( 'I love Wordpress and Wordpress loves me' ),
				'I love WordPress and WordPress loves me'
			);
		} );
	} );

	describe( '#parseHtml()', function() {
		test( 'should equal to null when input is not a string', function() {
			const types = [ {}, undefined, 1, true, [], function() {} ];

			types.forEach( function( type ) {
				chai.assert.equal( parseHtml( type ), null );
			} );
		} );

		test( 'should return a DOM element if you pass in DOM element', function() {
			const div = document.createElement( 'div' );
			chai.assert.equal( div, parseHtml( div ) );
		} );

		test( 'should return a document fragment if we pass in a string', function() {
			const fragment = parseHtml( 'hello' );
			chai.assert.isFunction( fragment.querySelector );
			chai.assert.equal( fragment.querySelectorAll( '*' ).length, 0 );
		} );

		test( 'should return a document fragment if we pass in a HTML string', function() {
			const fragment = parseHtml( '<div>hello</div>' );
			chai.assert.equal( fragment.querySelectorAll( 'div' ).length, 1 );
		} );

		test( 'should parseHtml and return document fragment that can be queried', function() {
			const strings = [
				'<span><a href="stuff">hello world</a></span>',
				'<div><span></span><a href="stuff">hello world</a></div>',
			];

			strings.forEach( function( string ) {
				const link = parseHtml( string ).querySelectorAll( 'a' );
				chai.assert.equal( link[ 0 ].innerHTML, 'hello world' );
			} );
		} );
	} );

	describe( '#decodeEntities()', () => {
		[ 'node', 'browser' ].forEach( env => {
			let decodeEntities;
			beforeAll( () => {
				switch ( env ) {
					case 'node':
						decodeEntities = decodeEntitiesNode;
					case 'browser':
						decodeEntities = decodeEntitiesBrowser;
				}
			} );

			describe( env, () => {
				test( 'should decode entities', () => {
					const decoded = decodeEntities( 'Ribs &gt; Chicken' );
					chai.assert.equal( decoded, 'Ribs > Chicken' );
				} );

				test( 'should not alter already-decoded entities', () => {
					const decoded = decodeEntities( 'Ribs > Chicken. Truth &amp; Liars.' );
					chai.assert.equal( decoded, 'Ribs > Chicken. Truth & Liars.' );
				} );
			} );
		} );
	} );

	describe( '#preventWidows()', () => {
		test( 'should not modify input if type is not string', () => {
			const types = [ {}, undefined, 1, true, [], function() {} ];

			types.forEach( type => {
				chai.assert.equal( preventWidows( type ), type );
			} );
		} );

		test( 'should return empty string when input is all whitespace', () => {
			const inputs = [ ' ', '\t', '\n' ];

			inputs.forEach( input => {
				chai.assert.equal( preventWidows( input ), '' );
			} );
		} );

		test( 'should return input when only one word', () => {
			chai.assert.equal( preventWidows( 'test' ), 'test' );
		} );

		test( 'should trim whitespace', () => {
			chai.assert.equal( preventWidows( 'test ' ), 'test' );
			chai.assert.equal( preventWidows( '\ntest string ' ), 'test\xA0string' );
		} );

		test( 'should add non-breaking space between words to keep', () => {
			const input = 'I really love BBQ. It is one of my favorite foods. Beef ribs are amazing.';
			chai.assert.equal(
				preventWidows( input ),
				'I really love BBQ. It is one of my favorite foods. Beef ribs are\xA0amazing.'
			);
			chai.assert.equal(
				preventWidows( input, 4 ),
				'I really love BBQ. It is one of my favorite foods. Beef\xA0ribs\xA0are\xA0amazing.'
			);
		} );
	} );
} );
