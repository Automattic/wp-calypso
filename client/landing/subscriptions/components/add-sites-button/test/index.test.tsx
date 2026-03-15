/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isDiscoverV3Enabled } from 'calypso/reader/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import * as noticesActions from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import { AddSitesButton } from '../index';

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( 'calypso/reader/utils', () => ( {
	...jest.requireActual( 'calypso/reader/utils' ),
	isDiscoverV3Enabled: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'AddSitesButton', () => {
	it( 'shows a link to the "reader/new" page when the feature is enabled', async () => {
		renderWithProvider(
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
				<AddSitesButton />
			</SubscriptionManagerContextProvider>
		);
		expect( screen.getByRole( 'link', { name: 'New subscription' } ) ).toHaveAttribute(
			'href',
			'/reader/new'
		);
	} );

	it( 'triggers a notice when the user is not email verified', async () => {
		( isCurrentUserEmailVerified as jest.Mock ).mockReturnValue( false );
		jest.spyOn( noticesActions, 'errorNotice' );

		renderWithProvider(
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
				<AddSitesButton />
			</SubscriptionManagerContextProvider>
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'New subscription' } ) );

		expect( noticesActions.errorNotice ).toHaveBeenCalledWith(
			'Please verify your email before subscribing.',
			{
				id: 'resend-verification-email',
				button: 'Account Settings',
				href: '/me/account',
			}
		);
	} );

	describe( 'when the feature discover v3 is disabled', () => {
		beforeEach( () => {
			( isDiscoverV3Enabled as jest.Mock ).mockReturnValue( false );
			( isCurrentUserEmailVerified as jest.Mock ).mockReturnValue( true );
		} );

		it( 'shows the add sites modal when the user clicks the button', async () => {
			renderWithProvider(
				<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
					<AddSitesButton />
				</SubscriptionManagerContextProvider>
			);
			await userEvent.click( screen.getByRole( 'button', { name: 'New subscription' } ) );

			expect(
				await screen.findByRole( 'dialog', { name: 'Add a New Subscription' } )
			).toBeInTheDocument();
		} );

		it( 'triggers a notice when the user is not email verified', async () => {
			( isCurrentUserEmailVerified as jest.Mock ).mockReturnValue( false );
			jest.spyOn( noticesActions, 'errorNotice' );

			renderWithProvider(
				<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
					<AddSitesButton />
				</SubscriptionManagerContextProvider>
			);
			await userEvent.click( screen.getByRole( 'button', { name: 'New subscription' } ) );

			expect( noticesActions.errorNotice ).toHaveBeenCalledWith(
				'Please verify your email before subscribing.',
				{
					id: 'resend-verification-email',
					button: 'Account Settings',
					href: '/me/account',
				}
			);
		} );
	} );
} );
