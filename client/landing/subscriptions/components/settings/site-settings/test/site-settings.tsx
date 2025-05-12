/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { Reader } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../../subscription-manager-context';
import { SiteSettingsPopover } from '../site-settings';

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

const queryClient = new QueryClient();

const Wrapper = ( { children }: { children: React.ReactNode } ) => (
	<QueryClientProvider client={ queryClient }>
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
			{ children }
		</SubscriptionManagerContextProvider>
	</QueryClientProvider>
);

describe( 'Site Settings', () => {
	it( 'Ensure correct href value of the View Feed button within the Site Settings popover', async () => {
		render(
			<SiteSettingsPopover
				notifyMeOfNewPosts={ false }
				onNotifyMeOfNewPostsChange={ () => undefined }
				updatingNotifyMeOfNewPosts={ false }
				emailMeNewPosts={ false }
				onEmailMeNewPostsChange={ () => undefined }
				updatingEmailMeNewPosts={ false }
				deliveryFrequency={ Reader.EmailDeliveryFrequency.Instantly }
				onDeliveryFrequencyChange={ () => undefined }
				updatingFrequency={ false }
				emailMeNewComments={ false }
				onEmailMeNewCommentsChange={ () => undefined }
				updatingEmailMeNewComments={ false }
				onUnsubscribe={ () => undefined }
				unsubscribing={ false }
				feedId={ 123456789 }
			/>,
			{ wrapper: Wrapper }
		);

		act( () => {
			userEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'link', { name: 'View feed' } ) ).toHaveAttribute(
				'href',
				'/reader/feeds/123456789'
			);
		} );
	} );
} );
