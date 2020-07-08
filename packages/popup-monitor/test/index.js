/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PopupMonitor from '../src';

describe( 'PopupMonitor', () => {
	let popupMonitor;

	beforeAll( () => {
		Object.assign( global.window, {
			screenTop: 0,
			screenLeft: 0,
			innerWidth: 1280,
			innerHeight: 720,
		} );
	} );

	beforeEach( () => {
		popupMonitor = new PopupMonitor();
	} );

	describe( '#getScreenCenterSpecs()', () => {
		test( 'should generate a popup specification string given the desired width and height', () => {
			const specs = popupMonitor.getScreenCenterSpecs( 650, 500 );

			expect( specs ).to.equal( 'width=650,height=500,top=110,left=315' );
		} );
	} );
} );
