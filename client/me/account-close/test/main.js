/**
 * @jest-environment jsdom
 */
import { monetizeSubscriptionsQuery, userPurchasesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import AccountSettingsClose from '../main';

describe( 'AccountSettingsClose', () => {
	it( 'Shows Manage purchases button when refundable purchases exist', () => {
		renderWithProviders( { is_refundable: true, is_automated_transfer: true } );
		expect( screen.queryByTestId( 'manage-purchases-button' ) ).toBeInTheDocument();
	} );

	it( 'Shows Manage purchases button when a renewable newsletter subscription exists', () => {
		renderWithProviders( {
			is_refundable: false,
			is_automated_transfer: false,
			monetizeSubscriptions: [ { ID: '1', status: 'active', is_renewable: true } ],
		} );
		expect( screen.queryByTestId( 'manage-purchases-button' ) ).toBeInTheDocument();
	} );

	it( 'Tells user to wait if they still have an Atomic site', () => {
		renderWithProviders( { is_refundable: false, is_automated_transfer: true } );
		expect( screen.queryByTestId( 'contact-support-button' ) ).toBeInTheDocument();
	} );

	it( 'Allows user to close account if no refundable purchases & no Atomic site', () => {
		renderWithProviders( { is_refundable: false, is_automated_transfer: false } );
		expect( screen.queryByTestId( 'close-account-button' ) ).toBeInTheDocument();
	} );
} );

function renderWithProviders( {
	is_refundable,
	is_automated_transfer,
	monetizeSubscriptions = [],
} ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( userPurchasesQuery().queryKey, [
		{
			ID: 1,
			is_cancelable: true,
			is_refundable,
			product_slug: 'premium_theme',
			subscription_status: 'active',
			user_id: 1,
		},
	] );
	queryClient.setQueryData( monetizeSubscriptionsQuery().queryKey, monetizeSubscriptions );

	return render(
		<QueryClientProvider client={ queryClient }>
			<ReduxProvider store={ createTestStore( is_automated_transfer ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		</QueryClientProvider>
	);
}

function createTestStore( is_automated_transfer ) {
	return createReduxStore(
		{
			currentUser: {
				id: 1,
				user: {
					primary_blog: 'example',
				},
			},
			sites: {
				items: {
					1234: {
						ID: '1234',
						URL: 'http://example.com',
						is_wpcom_atomic: true,
						options: {
							is_automated_transfer,
						},
					},
				},
			},
		},
		( state ) => {
			return state;
		}
	);
}
