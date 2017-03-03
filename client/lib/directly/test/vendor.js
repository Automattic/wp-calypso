/**
 * External dependencies
 */
import { expect } from 'chai';

 /**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

const BASE_CONFIG = { id: '123' };
const DIRECTLY_BASE_URL = 'https://www.directly.com';
const DIRECTLY_WIDGET_CLASSNAME = '.directly-rtm';

describe( 'vendor', () => {
	let vendor;
	useFakeDom();

	beforeEach( () => {
		vendor = require( '../vendor' );
	} );

	afterEach( () => {
		// After each test, clean up the globals put in place by Directly and delete the
		// cached module so its internal variables are reset
		const widgets = document.querySelectorAll( DIRECTLY_WIDGET_CLASSNAME );
		for ( let i = 0; i < widgets.length; i++ ) {
			widgets[ i ].remove();
		}
		delete window.DirectlyRTM;
		delete require.cache[ require.resolve( '../vendor' ) ];
	} );

	describe( '#initializeDirectly', () => {
		it( 'runs the initialization code', () => {
			vendor.initializeDirectly( BASE_CONFIG );
			// Ensure that the widget wrapper and iframe have been added to the page
			const widget = document.querySelector( DIRECTLY_WIDGET_CLASSNAME );
			expect( widget ).not.to.be.null;
			expect( widget.querySelector( 'iframe' ) ).not.to.be.null;
		} );

		it( 'uses the given config data for Directly', () => {
			vendor.initializeDirectly( BASE_CONFIG );

			expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
			expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
			expect( window.DirectlyRTM.cq[ 0 ][ 1 ] ).to.equal( BASE_CONFIG );
		} );

		it( 'uses default base URL when one isn\'t specified', () => {
			vendor.initializeDirectly( BASE_CONFIG );
			const iframe = document.querySelector( DIRECTLY_WIDGET_CLASSNAME + ' iframe' );
			expect( iframe.src.indexOf( DIRECTLY_BASE_URL ) ).to.equal( 0 );
		} );

		it( 'uses custom base URLs when specified', () => {
			const url = 'https://automattic.com';
			vendor.initializeDirectly( BASE_CONFIG, url );
			const iframe = document.querySelector( DIRECTLY_WIDGET_CLASSNAME + ' iframe' );
			expect( iframe.src.indexOf( url ) ).to.equal( 0 );
		} );

		it( 'does nothing after the first call', () => {
			const config1 = { id: '1', a: 'e', b: 'e', c: 'e' };
			const config2 = { id: '2', m: '4', n: '5', o: '6' };
			const config3 = { id: '3', x: '7', y: '8', z: '9' };

			vendor.initializeDirectly( config1 );
			vendor.initializeDirectly( config2 );
			vendor.initializeDirectly( config3 );

			expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
			expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
			Object.keys( config1 ).forEach( ( key ) => {
				expect( window.DirectlyRTM.cq[ 0 ][ 1 ][ key ] ).to.equal( config1[ key ] );
			} );
		} );
	} );
} );
