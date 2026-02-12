/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { isDiscoverV3Enabled } from 'calypso/reader/utils';
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

describe( 'AddSitesButton', () => {
	it( 'shows a link to the discover v3 page when the feature is enabled', async () => {
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

	describe( 'when the feature discover v3 is disabled', () => {
		beforeEach( () => {
			( isDiscoverV3Enabled as jest.Mock ).mockReturnValue( false );
		} );

		it( 'triggers the modal when the feature is disabled', async () => {
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
	} );
} );
