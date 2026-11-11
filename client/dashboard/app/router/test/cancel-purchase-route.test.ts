/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { cancelPurchaseRoute } from '../me';
import type { Purchase } from '@automattic/api-core';

const API_ROOT = 'https://public-api.wordpress.com';

// A real site the purchase owner has been removed from — a disconnected Jetpack
// site, or a deleted site. `blog_id` is set and it is not a holding site, so
// `hasQueryableSite()` returns true, but every `/sites/{blog_id}/…` request 403s.
const UNREACHABLE_BLOG_ID = 89548731;
const PURCHASE_ID = 25718036;

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: PURCHASE_ID,
		blog_id: UNREACHABLE_BLOG_ID,
		is_attached_to_holding_site: false,
		product_slug: 'jetpack_scan',
		is_refundable: false,
		is_auto_renew_enabled: true,
		expiry_status: 'auto-renewing',
		...overrides,
	} as unknown as Purchase;
}

type CancelPurchaseLoader = ( ctx: {
	parentMatchPromise: Promise< { loaderData?: { purchase?: Purchase } } >;
	deps: { intent?: string };
} ) => Promise< { purchase?: Purchase; intent?: string } >;

function runLoader( purchase: Purchase ) {
	const loader = cancelPurchaseRoute.options.loader as unknown as CancelPurchaseLoader;
	return loader( {
		parentMatchPromise: Promise.resolve( { loaderData: { purchase } } ),
		deps: { intent: undefined },
	} );
}

/**
 * Everything the loader fetches that is *not* scoped to the purchase's site.
 * These must succeed so a failing test can only be caused by the site-scoped
 * requests.
 */
function interceptUserScopedQueries() {
	nock( API_ROOT ).get( '/rest/v1.1/products/' ).query( true ).reply( 200, {} );
	nock( API_ROOT ).get( '/rest/v1.5/plans' ).query( true ).reply( 200, [] );
	nock( API_ROOT )
		.get( `/wpcom/v2/upgrades/${ PURCHASE_ID }/cancel-features` )
		.query( true )
		.reply( 200, { features: [] } );
}

describe( 'cancelPurchaseRoute loader', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'resolves when the site-scoped queries 403 for an unreachable site', async () => {
		interceptUserScopedQueries();

		// `/upgrades?site=…` and `/sites/{id}/features` both run the blog manage
		// check, which fails because the user was removed from the site.
		const sitePurchases = nock( API_ROOT )
			.get( '/rest/v1.2/upgrades' )
			.query( true )
			.reply( 403, { error: 'unauthorized', message: 'User cannot access upgrades.' } );
		const siteFeatures = nock( API_ROOT )
			.get( `/rest/v1.1/sites/${ UNREACHABLE_BLOG_ID }/features` )
			.query( true )
			.reply( 403, { error: 'unauthorized', message: 'User cannot access upgrades.' } );

		const purchase = makePurchase();

		await expect( runLoader( purchase ) ).resolves.toEqual(
			expect.objectContaining( { purchase } )
		);

		expect( sitePurchases.isDone() ).toBe( true );
		expect( siteFeatures.isDone() ).toBe( true );
	} );
} );
