/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import {
	stripeConfiguration,
	mockStripeElements,
} from 'calypso/my-sites/checkout/composite-checkout/test/util';
import { createTestReduxStore, setCommonTestReduxState, storedCard1 } from 'calypso/state/utils';
import ChangePaymentMethod from '../change-payment-method';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

jest.mock( '@stripe/react-stripe-js', () => {
	const stripe = jest.requireActual( '@stripe/react-stripe-js' );

	return {
		...stripe,
		...mockStripeElements(),
	};
} );

jest.mock( '@stripe/stripe-js', () => {
	return {
		loadStripe: async () => mockStripeElements().useStripe(),
	};
} );

// `recordPageView()` calls `fetch` for analytics with no guards and `fetch` is
// not available outside of a browser so we must mock it here to avoid fatals.
global.fetch = jest.fn( () => Promise.resolve( { ok: false } ) ) as jest.Mock;

describe( 'ChangePaymentMethod', () => {
	it( 'renders a list of existing cards', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: StoredCard[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/payment-methods?expired=include' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ setCommonTestReduxState( createTestReduxStore() ) }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( new RegExp( storedCard1.name ) ) ).toBeInTheDocument();
	} );

	it( 'renders a new credit card payment method', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: StoredCard[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/payment-methods?expired=include' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ setCommonTestReduxState( createTestReduxStore() ) }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( 'Credit or debit card' ) ).toBeInTheDocument();
	} );

	it( 'renders a PayPal payment method', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: StoredCard[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/payment-methods?expired=include' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ setCommonTestReduxState( createTestReduxStore() ) }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( 'PayPal' ) ).toBeInTheDocument();
	} );
} );
