/**
 * @jest-environment jsdom
 */

import { setBundledPluginSlug } from '../actions';

const siteSlug = 'test.wordpress.com';
const pluginSlug = 'woocommerce';

describe( 'Onboard Actions', () => {
	it( 'should return a SET_BUNDLED_PLUGIN_SLUG Action', () => {
		const expected = {
			type: 'SET_BUNDLED_PLUGIN_SLUG',
			siteSlug,
			pluginSlug,
		};

		expect( setBundledPluginSlug( siteSlug, pluginSlug ) ).toEqual( expected );
	} );
} );
