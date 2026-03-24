/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import { AddSitesButton } from '../index';

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
} );
