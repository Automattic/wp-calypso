/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock, vi } from 'vitest';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import * as noticesActions from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import { AddSitesButton } from '../index';

vi.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: vi.fn().mockReturnValue( true ),
} ) );

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
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
		( isCurrentUserEmailVerified as Mock ).mockReturnValue( false );
		vi.spyOn( noticesActions, 'errorNotice' );

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
