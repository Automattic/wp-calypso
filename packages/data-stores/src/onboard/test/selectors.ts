/**
 * @jest-environment jsdom
 */

import { getBundledPluginSlug } from '../selectors';
import type { State } from '../reducer';

describe( 'getBundledPluginSlug', () => {
	it( 'retrieves the bundled plugin slug from the store', () => {
		const siteSlug = 'test.wordpress.com';
		const pluginSlug = 'woocommerce';

		const state: State = {
			bundledPluginSlug: {
				[ siteSlug ]: pluginSlug,
			},
		};

		expect( getBundledPluginSlug( state, siteSlug ) ).toEqual( pluginSlug );
	} );
} );
