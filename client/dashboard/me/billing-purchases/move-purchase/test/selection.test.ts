import {
	getCompanionItems,
	getDefaultSelection,
	getSelectedSubscriptionIds,
	getVisibleWarnings,
} from '../selection';
import type { Purchase, SiteTransferItem, SiteTransferPreview } from '@automattic/api-core';

function makeItem( overrides: Partial< SiteTransferItem > ): SiteTransferItem {
	return {
		key: 'domain:example.com',
		type: 'domain',
		label: 'example.com',
		subscription_ids: [ 20 ],
		product_names: [ 'Domain Registration' ],
		notes: [],
		blocker: null,
		...overrides,
	};
}

const plan = makeItem( {
	key: 'plan:10',
	type: 'plan',
	label: 'Business',
	subscription_ids: [ 10 ],
	product_names: [ 'Business' ],
} );
const bundledDomain = makeItem( {
	key: 'domain:bundled.com',
	label: 'bundled.com',
	subscription_ids: [ 21, 22 ],
} );
const otherDomain = makeItem( {
	key: 'domain:other.com',
	label: 'other.com',
	subscription_ids: [ 23 ],
} );
const storage = makeItem( {
	key: 'storage_add_on:30',
	type: 'storage_add_on',
	label: 'Storage',
	subscription_ids: [ 30 ],
} );

function makePreview( overrides: Partial< SiteTransferPreview > = {} ): SiteTransferPreview {
	return {
		primary: plan,
		source_blog_id: 1,
		target_blog_id: 2,
		can_transfer: true,
		blockers: [],
		warnings: [],
		items: [ otherDomain, storage, bundledDomain ],
		state_token: 'token',
		...overrides,
	};
}

const planPurchase = { ID: 10, included_domain: 'Bundled.com' } as Purchase;

describe( 'getCompanionItems', () => {
	test( 'offers only domains when moving a plan, bundled domain first', () => {
		expect( getCompanionItems( makePreview(), planPurchase ) ).toEqual( [
			bundledDomain,
			otherDomain,
		] );
	} );

	test( 'offers nothing when moving a domain', () => {
		const preview = makePreview( { primary: bundledDomain, items: [ plan, otherDomain ] } );
		expect( getCompanionItems( preview, { ID: 21 } as Purchase ) ).toEqual( [] );
	} );
} );

describe( 'getDefaultSelection', () => {
	test( 'selects the bundled domain', () => {
		expect( getDefaultSelection( makePreview(), planPurchase ) ).toEqual(
			new Set( [ 'domain:bundled.com' ] )
		);
	} );

	test( 'selects nothing when the bundled domain cannot move', () => {
		const blocked = { ...bundledDomain, blocker: { code: 'x', message: 'No.' } };
		const preview = makePreview( { items: [ blocked, otherDomain ] } );
		expect( getDefaultSelection( preview, planPurchase ) ).toEqual( new Set() );
	} );

	test( 'selects nothing for a plan without a bundled domain', () => {
		expect( getDefaultSelection( makePreview(), { ID: 10 } as Purchase ) ).toEqual( new Set() );
	} );
} );

describe( 'getVisibleWarnings', () => {
	test( 'hides warnings about selected items', () => {
		const general = { code: 'source_loses_custom_primary_domain', message: 'A' };
		const aboutDomain = {
			code: 'bundled_domain_on_source',
			message: 'B',
			item_key: 'domain:bundled.com',
		};
		const preview = makePreview( { warnings: [ general, aboutDomain ] } );

		expect( getVisibleWarnings( preview, new Set() ) ).toEqual( [ general, aboutDomain ] );
		expect( getVisibleWarnings( preview, new Set( [ 'domain:bundled.com' ] ) ) ).toEqual( [
			general,
		] );
	} );
} );

describe( 'getSelectedSubscriptionIds', () => {
	test( 'names each selected, movable item by its first subscription', () => {
		const blocked = { ...otherDomain, blocker: { code: 'x', message: 'No.' } };
		expect(
			getSelectedSubscriptionIds(
				[ bundledDomain, blocked ],
				new Set( [ 'domain:bundled.com', 'domain:other.com' ] )
			)
		).toEqual( [ 21 ] );
	} );
} );
