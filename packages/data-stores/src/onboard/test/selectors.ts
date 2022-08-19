/**
 * @jest-environment jsdom
 */

import { getBundledPluginSlug } from '../selectors';
import type { State } from '../reducer';

describe( 'getBundledPluginSlug', () => {
	it( 'retrieves the bundled plugin slug from the store', () => {
		const slug = 'woocommerce';

		const state: State = {
			bundledPluginSlug: slug,
		};

		expect( getBundledPluginSlug( state ) ).toEqual( slug );
	} );
} );
