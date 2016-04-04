/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import decodeEntitiesNode from '../decode-entities/node';

describe( 'formatting', () => {
	let formatting, capitalPDangit, parseHtml, decodeEntitiesBrowser;

	useFakeDom();

	before( () => {
		formatting = require( '../' );
		capitalPDangit = formatting.capitalPDangit;
		parseHtml = formatting.parseHtml;
		decodeEntitiesBrowser = require( '../decode-entities/browser' );
	} );

	describe( '#capitalPDangit()', function() {
		it( 'should error when input is not a string', function() {
			var types = [
				{},
				undefined,
				1,
				true,
				[],
				function() {}
			];

			types.forEach( function( type ) {
				chai.expect( function() {
					capitalPDangit( type );
				} ).to.throw( Error );
			} );
		} );

		it( 'should not modify wordpress', function() {
			var strings = [ 'wordpress', 'I love wordpress' ];

			strings.forEach( function( string ) {
				chai.assert.equal( capitalPDangit( string ), string );
			} );
		} );

		it( 'should return WordPress with a capital P when passed Wordpress', function() {
			chai.assert.equal( capitalPDangit( 'Wordpress' ), 'WordPress' );
			chai.assert.equal( capitalPDangit( 'I love Wordpress' ), 'I love WordPress' );
		} );

		it( 'should replace all instances of Wordpress', function() {
			chai.assert.equal( capitalPDangit( 'Wordpress Wordpress' ), 'WordPress WordPress' );
			chai.assert.equal( capitalPDangit( 'I love Wordpress and Wordpress loves me' ), 'I love WordPress and WordPress loves me' );
		} )
	} );

	describe( '#parseHtml()', function() {
		it( 'should equal to null when input is not a string', function() {
			var types = [
				{},
				undefined,
				1,
				true,
				[],
				function() {}
			];

			types.forEach( function( type ) {
				chai.assert.equal( parseHtml( type ), null );
			} );
		} );

		it( 'should return a DOM element if you pass in DOM element', function() {
			let div = document.createElement( 'div' );
			chai.assert.equal( div, parseHtml( div ) );
		} );

		it( 'should return a document fragment if we pass in a string', function() {
			let fragment = parseHtml( 'hello' );
			chai.assert.isFunction( fragment.querySelector );
			chai.assert.equal( fragment.querySelectorAll( '*' ).length, 0 );
		} );
		it( 'should return a document fragment if we pass in a HTML string', function() {
			let fragment = parseHtml( '<div>hello</div>' );
			chai.assert.equal( fragment.querySelectorAll( 'div' ).length, 1 );
		} );

		it( 'should parseHtml and return document fragment that can be queried', function() {
			var strings = [
				'<span><a href="stuff">hello world</a></span>',
				'<div><span></span><a href="stuff">hello world</a></div>'
			];

			strings.forEach( function( string ) {
				var link = parseHtml( string ).querySelectorAll( 'a' );
				chai.assert.equal( link[ 0 ].innerHTML, 'hello world' );
			} );
		} );
	} );

	describe( '#decodeEntities()', () => {
		[ 'node', 'browser' ].forEach( ( env ) => {
			let decodeEntities;
			before( () => {
				switch ( env ) {
					case 'node': decodeEntities = decodeEntitiesNode;
					case 'browser': decodeEntities = decodeEntitiesBrowser;
				}
			} );

			describe( env, () => {
				it( 'should decode entities', () => {
					const decoded = decodeEntities( 'Ribs &gt; Chicken' );
					chai.assert.equal( decoded, 'Ribs > Chicken' );
				} );

				it( 'should not alter already-decoded entities', () => {
					const decoded = decodeEntities( 'Ribs > Chicken. Truth &amp; Liars.' );
					chai.assert.equal( decoded, 'Ribs > Chicken. Truth & Liars.' );
				} );
			} );
		} );
	} );
} );
