/**
 * @jest-environment jsdom
 */

import {
	hasPurchaseBeenExtendedQuery,
	plansQuery,
	productsQuery,
	purchaseCancelFeaturesQuery,
	purchaseQuery,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import CancelPurchase from '../index';
import type { Purchase } from '@automattic/api-core';

jest.mock( '../../../../app/router/me', () => ( {
	cancelPurchaseRoute: { fullPath: '__root__', useParams: () => ( { purchaseId: '123' } ) },
	purchaseSettingsRoute: { fullPath: '/me/billing/purchases/$purchaseId' },
	purchasesRoute: { to: '/me/billing/purchases' },
} ) );

const purchase = {
	ID: 123,
	blog_id: 456,
	site_slug: 'example.wordpress.com',
	product_name: 'WordPress.com Premium',
	product_slug: 'value_bundle',
	bill_period_days: 365,
	is_plan: true,
	is_cancelable: true,
	is_removable: true,
	can_disable_auto_renew: true,
	is_auto_renew_enabled: false,
	subscription_status: 'active',
	currency_code: 'USD',
	expiry_date: '2027-04-06T00:00:00+00:00',
} as Purchase;

function mockSiteRequests() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: purchase.blog_id } )
		.reply( 200, [] )
		.get( `/rest/v1.1/sites/${ purchase.blog_id }/features` )
		.query( true )
		.reply( 200, { active: [], available: {} } )
		.get( `/rest/v1.1/sites/${ purchase.blog_id }` )
		.query( true )
		.reply( 200, { ID: purchase.blog_id, slug: purchase.site_slug } )
		.get( `/wpcom/v2/sites/${ purchase.blog_id }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, {} )
		.get( `/rest/v1.2/sites/${ purchase.blog_id }/domains` )
		.query( true )
		.reply( 200, { domains: [] } )
		.get( '/wpcom/v2/cancellation-offers' )
		.query( true )
		.reply( 200, [] );
}

function renderRemoveFlow() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, purchase );
	queryClient.setQueryData( plansQuery().queryKey, [] );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( purchase.ID ).queryKey, [] );
	queryClient.setQueryData( productsQuery().queryKey, {} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
	// The page passes the blog ID as this query's purchase ID.
	queryClient.setQueryData( hasPurchaseBeenExtendedQuery( purchase.blog_id ).queryKey, false );
	mockSiteRequests();

	return render( <CancelPurchase />, { queryClient } );
}

async function startSurvey( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'checkbox' ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

const optionsListName = 'Before canceling, you can consider these options:';

const findOptions = () => screen.findByRole( 'list', { name: optionsListName } );

describe( '<CancelPurchase />', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/?intent=remove' );
	} );

	describe( 'with the cards flag on', () => {
		beforeAll( () => {
			enable( 'purchases/cancel-options-cards' );
		} );

		afterAll( () => {
			disable( 'purchases/cancel-options-cards' );
		} );

		test( 'shows Ask AI and Support for "Another reason" with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Another reason…' } ) );
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			const options = await findOptions();
			expect(
				within( options ).getByRole( 'button', { name: /Ask WordPress Agent/ } )
			).toBeVisible();
			expect(
				within( options ).getByRole( 'button', { name: /Speak with our support team/ } )
			).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.objectContaining( {
					solution_ids: 'ask-ai-assistant,speak-with-support',
					cancellation_reason: 'anotherReasonOne',
				} )
			);
		} );

		test( 'shows Ask AI and Support for a "Something else" answer with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Too expensive' } ) );
			await user.click(
				screen.getByRole( 'radio', { name: 'Something else related to price/value' } )
			);
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( await findOptions() ).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.objectContaining( {
					solution_ids: 'ask-ai-assistant,speak-with-support',
					cancellation_reason: 'otherPriceValue',
				} )
			);
		} );
	} );
} );
