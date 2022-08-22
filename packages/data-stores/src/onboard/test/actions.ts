/**
 * @jest-environment jsdom
 */

import { setBundledPluginSlug } from '../actions';

const slug = 'woocommerce';

describe( 'Onboard Actions', () => {
	it( 'should return a SET_BUNDLED_PLUGIN_SLUG Action', () => {
		const expected = {
			type: 'SET_BUNDLED_PLUGIN_SLUG',
			slug,
		};

		expect( setBundledPluginSlug( slug ) ).toEqual( expected );
	} );
} );
