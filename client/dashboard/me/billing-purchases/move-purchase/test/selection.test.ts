import {
	getCompanionItems,
	getDefaultSelection,
	getSelectedSubscriptionIds,
	getVisibleWarnings,
} from '../selection';
import type { SiteTransferItem, SiteTransferPreview } from '@automattic/api-core';

function makeItem( overrides: Partial< SiteTransferItem > ): SiteTransferItem {
	return {
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
	type: 'plan',
	label: 'Business',
	subscription_ids: [ 10 ],
	product_names: [ 'Business' ],
} );
const bundledDomain = makeItem( { label: 'bundled.com', subscription_ids: [ 21, 22 ] } );
const otherDomain = makeItem( { label: 'other.com', subscription_ids: [ 23 ] } );
const storage = makeItem( { type: 'storage_add_on', label: 'Storage', subscription_ids: [ 30 ] } );

// The plan's `included_domain_purchase_id`.
const BUNDLED_ID = 21;

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

describe( 'getCompanionItems', () => {
	test( 'offers only domains when moving a plan, bundled domain first', () => {
		expect( getCompanionItems( makePreview(), BUNDLED_ID ) ).toEqual( [
			bundledDomain,
			otherDomain,
		] );
	} );

	test( 'offers nothing when moving a domain', () => {
		const preview = makePreview( { primary: bundledDomain, items: [ plan, otherDomain ] } );
		expect( getCompanionItems( preview, null ) ).toEqual( [] );
	} );
} );

describe( 'getDefaultSelection', () => {
	test( 'selects the bundled domain', () => {
		const companions = getCompanionItems( makePreview(), BUNDLED_ID );
		expect(
			getSelectedSubscriptionIds( companions, getDefaultSelection( companions, BUNDLED_ID ) )
		).toEqual( [ 21 ] );
	} );

	test( 'selects nothing when the bundled domain cannot move', () => {
		const blocked = { ...bundledDomain, blocker: { code: 'x', message: 'No.' } };
		expect( getDefaultSelection( [ blocked, otherDomain ], BUNDLED_ID ) ).toEqual( new Set() );
	} );

	test( 'selects nothing for a plan without a bundled domain', () => {
		const companions = getCompanionItems( makePreview(), null );
		expect( getDefaultSelection( companions, null ) ).toEqual( new Set() );
	} );
} );

describe( 'getVisibleWarnings', () => {
	test( 'hides warnings about items that are moving too', () => {
		const general = { code: 'source_loses_custom_primary_domain', message: 'A' };
		// A warning can name any of the item's subscriptions.
		const aboutDomain = {
			code: 'bundled_domain_on_source',
			message: 'B',
			subscription_ids: [ 22 ],
		};
		const preview = makePreview( { warnings: [ general, aboutDomain ] } );
		const companions = [ bundledDomain, otherDomain ];

		expect( getVisibleWarnings( preview, companions, new Set() ) ).toEqual( [
			general,
			aboutDomain,
		] );
		expect( getVisibleWarnings( preview, companions, new Set( [ 21 ] ) ) ).toEqual( [ general ] );
	} );
} );

describe( 'getSelectedSubscriptionIds', () => {
	test( 'names each selected, movable item by its first subscription', () => {
		const blocked = { ...otherDomain, blocker: { code: 'x', message: 'No.' } };
		expect(
			getSelectedSubscriptionIds( [ bundledDomain, blocked ], new Set( [ 22, 23 ] ) )
		).toEqual( [ 21 ] );
	} );
} );
