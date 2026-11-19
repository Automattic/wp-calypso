/**
 * @jest-environment jsdom
 */
import { createSitePreviewScreenshot } from '../mshot';

describe( 'createSitePreviewScreenshot', () => {
	it( 'asks mShots for the desktop capture the site checks show', () => {
		const open = jest.spyOn( XMLHttpRequest.prototype, 'open' ).mockImplementation( () => {} );
		const send = jest.spyOn( XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );

		createSitePreviewScreenshot( 'https://example.com' );

		expect( open ).toHaveBeenCalledWith(
			'GET',
			'https://s0.wp.com/mshots/v1/https%3A%2F%2Fexample.com?vpw=1440&vph=1440&w=1440&h=1462&screen_height=1440&scale=2'
		);
		expect( send ).toHaveBeenCalledTimes( 1 );
	} );
} );
