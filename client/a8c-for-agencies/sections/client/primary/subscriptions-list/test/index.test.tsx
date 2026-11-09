/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import a8cForAgencies from 'calypso/state/a8c-for-agencies/reducer';
import documentHead from 'calypso/state/document-head/reducer';
import preferences from 'calypso/state/preferences/reducer';
import ui from 'calypso/state/ui/reducer';
import userSettings from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SubscriptionsList from '../index';
import type { ReferralProduct } from '../../../types';

const mockReferrals = ( product: Partial< ReferralProduct > ) => {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency-client/referrals' )
		.query( true )
		.reply( 200, [
			{
				id: 1,
				status: 'active',
				products: [
					{
						product_id: 10,
						quantity: 1,
						license: { license_key: 'license-key' },
						site_assigned: '',
						...product,
					},
				],
			},
		] );
};

const renderSubscriptionsList = () =>
	renderWithProvider( <SubscriptionsList />, {
		reducers: { a8cForAgencies, documentHead, preferences, ui, userSettings },
	} );

describe( '<SubscriptionsList>', () => {
	beforeEach( () => {
		// The table only renders at the desktop breakpoint; narrower viewports get the mobile cards.
		jest.mocked( window.matchMedia ).mockImplementation(
			( query ) =>
				( {
					matches: query === '(min-width: 961px)',
					media: query,
					addListener: jest.fn(),
					removeListener: jest.fn(),
				} ) as unknown as MediaQueryList
		);

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/agency-client/public/products' )
			.query( true )
			.reply( 200, [
				{
					name: 'Jetpack Backup',
					slug: 'jetpack-backup',
					products: [
						{
							product_id: 10,
							name: 'Jetpack Backup (10GB)',
							slug: 'jetpack-backup-t1',
							amount: '5.00',
						},
					],
				},
			] );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'does not offer cancel for a subscription that is no longer active', async () => {
		mockReferrals( { status: 'canceled' } );

		renderSubscriptionsList();

		expect( await screen.findByText( 'Jetpack Backup (10GB)' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Cancel subscription' } )
		).not.toBeInTheDocument();
	} );

	test( 'does not offer cancel when auto-renew is already off', async () => {
		mockReferrals( {
			status: 'active',
			subscription: {
				id: 'sub-1',
				product_name: 'Jetpack Backup (10GB)',
				status: 'active',
				is_auto_renew_enabled: false,
			},
		} );

		renderSubscriptionsList();

		expect( await screen.findByText( 'Jetpack Backup (10GB)' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Cancel subscription' } )
		).not.toBeInTheDocument();
	} );
} );
