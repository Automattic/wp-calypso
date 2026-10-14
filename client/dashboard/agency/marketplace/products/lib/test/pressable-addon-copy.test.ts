import { getPressableAddonCopy } from '../pressable-addon-copy';
import type { AgencyProduct, AgencyProductMetadata } from '@automattic/api-core';

const addon = ( slug: string, metadata?: Partial< AgencyProductMetadata > ): AgencyProduct => ( {
	name: slug,
	slug,
	product_id: 1,
	currency: 'USD',
	family_slug: 'pressable-addon',
	metadata: metadata && {
		sites: 0,
		visits: 0,
		storage: 0,
		php_worker_count: 0,
		category: 'pressable-addon',
		...metadata,
	},
} );

const GENERIC_CALLOUT =
	'This add-on increases your Signature plan limits while your plan is active.';

describe( 'getPressableAddonCopy', () => {
	test( 'reads the site, storage, and visits increase from the server metadata', () => {
		expect(
			getPressableAddonCopy(
				addon( 'pressable-addon-sites-5', { sites: 5, storage: 10, visits: 50000 } )
			).callout
		).toBe(
			'Site limit will be increased by 5, storage by 10 GB, and visits by 50,000 on your Signature plan.'
		);
	} );

	test( 'falls back to the generic copy when the server sends no PHP memory value', () => {
		expect(
			getPressableAddonCopy( addon( 'pressable-addon-php-memory-512mb', { php_memory: null } ) )
				.callout
		).toBe( GENERIC_CALLOUT );
	} );

	test( 'falls back to the generic copy for an unknown add-on or missing metadata', () => {
		expect(
			getPressableAddonCopy( addon( 'pressable-addon-new-thing', { sites: 3 } ) ).callout
		).toBe( GENERIC_CALLOUT );
		expect( getPressableAddonCopy( addon( 'pressable-addon-sites-5' ) ).callout ).toBe(
			GENERIC_CALLOUT
		);
	} );
} );
