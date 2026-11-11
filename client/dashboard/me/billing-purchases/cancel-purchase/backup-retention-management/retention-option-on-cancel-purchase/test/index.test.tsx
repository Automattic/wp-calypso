/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../../../test-utils';
import BackupRetentionOptionOnCancelPurchase from '../index';
import type { Purchase } from '@automattic/api-core';

const SITE_ID = 12345;

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 999,
		blog_id: SITE_ID,
		site_slug: 'example.wordpress.com',
		product_type: 'jetpack',
		is_attached_to_holding_site: false,
		...overrides,
	} as Purchase;
}

/**
 * Intercepts every site-scoped endpoint this component reads and records the
 * hits. Replies 403 `authorization_required` — what the API actually returns
 * for a holding site the user is not a member of.
 */
function interceptSiteRequests() {
	const onSiteRequest = jest.fn();
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( new RegExp( `/sites/${ SITE_ID }(/|\\?|$)` ) )
		.query( true )
		.reply( ( uri ) => {
			onSiteRequest( uri );
			return [ 403, { error: 'authorization_required', message: 'API calls to this blog...' } ];
		} );
	return onSiteRequest;
}

describe( '<BackupRetentionOptionOnCancelPurchase />', () => {
	test( 'makes no site-scoped request for a holding-site purchase', async () => {
		const onSiteRequest = interceptSiteRequests();

		render(
			<BackupRetentionOptionOnCancelPurchase
				siteId={ SITE_ID }
				purchase={ makePurchase( {
					is_attached_to_holding_site: true,
					product_type: 'akismet',
					product_slug: 'ak_personal_yearly',
				} ) }
			/>
		);

		// A siteless purchase has no backup storage to offer, so nothing renders.
		expect(
			screen.queryByRole( 'button', { name: /confirm and keep subscription/i } )
		).not.toBeInTheDocument();

		// The regression: each of these requests 403s, and the dashboard auth layer
		// turns a 403 `authorization_required` into a /log-in redirect. SHILL-2295.
		await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
		expect( onSiteRequest ).not.toHaveBeenCalled();
	} );

	test( 'requests site-scoped endpoints for a purchase on a real site', async () => {
		const onSiteRequest = interceptSiteRequests();

		render(
			<BackupRetentionOptionOnCancelPurchase siteId={ SITE_ID } purchase={ makePurchase() } />
		);

		await waitFor( () => expect( onSiteRequest ).toHaveBeenCalled() );
	} );
} );
