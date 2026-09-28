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
	test( 'names the site, storage, and visits increase for a sites add-on', () => {
		const copy = getPressableAddonCopy(
			addon( 'pressable-addon-sites-5', { sites: 5, storage: 10, visits: 50000 } )
		);
		expect( copy.callout ).toBe(
			'Site limit will be increased by 5, storage by 10 GB, and visits by 50,000 on your Signature plan.'
		);
		expect( copy.limit ).toBe(
			'This add-on increases your Signature plan by 5 sites, 10 GB of storage, and 50,000 monthly visits while your plan is active.'
		);
	} );

	test( 'uses the singular form for a one-site add-on', () => {
		expect(
			getPressableAddonCopy(
				addon( 'pressable-addon-sites-1', { sites: 1, storage: 2, visits: 1000 } )
			).limit
		).toBe(
			'This add-on increases your Signature plan by 1 site, 2 GB of storage, and 1,000 monthly visits while your plan is active.'
		);
	} );

	test( 'names the storage increase for a storage add-on', () => {
		expect(
			getPressableAddonCopy( addon( 'pressable-addon-storage-64gb', { storage: 64 } ) ).callout
		).toBe( 'Storage limit will be increased by 64 GB on your Signature plan.' );
	} );

	test( 'names the visits increase for a visits add-on', () => {
		expect(
			getPressableAddonCopy( addon( 'pressable-addon-visits-100k', { visits: 100000 } ) ).callout
		).toBe( 'Visits limit will be increased by 100,000 monthly visits on your Signature plan.' );
	} );

	test( 'names the PHP memory increase from the server value', () => {
		expect(
			getPressableAddonCopy( addon( 'pressable-addon-php-memory-512mb', { php_memory: 512 } ) )
				.callout
		).toBe(
			'PHP memory will be increased by 512 MB for each PHP worker/process on one Pressable site/domain.'
		);
	} );

	test( 'falls back to the generic copy when the server sends no PHP memory value', () => {
		expect( getPressableAddonCopy( addon( 'pressable-addon-php-memory-512mb', {} ) ).callout ).toBe(
			GENERIC_CALLOUT
		);
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
