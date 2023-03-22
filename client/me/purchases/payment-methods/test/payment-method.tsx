/**
 * @jest-environment jsdom
 */

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PaymentMethodList from '../payment-method-list';
import type { StoredPaymentMethodCard } from '../../../../lib/checkout/payment-methods';

const card: StoredPaymentMethodCard = {
	stored_details_id: '1234',
	user_id: '5432',
	name: 'Human Person',
	country_code: 'US',
	payment_partner: 'stripe',
	payment_partner_reference: '',
	payment_partner_source_id: '',
	mp_ref: 'mock-mp-ref',
	email: '',
	card_expiry_year: '80',
	card_expiry_month: '01',
	expiry: '2080-01-31',
	remember: true,
	source: '',
	original_stored_details_id: '',
	is_rechargable: true,
	payment_type: '',
	is_expired: false,
	is_backup: false,
	tax_location: null,
	card_type: 'mastercard',
	card_iin: '',
	card_last_4: '4242',
	card_zip: '',
};

describe( 'PaymentMethod', () => {
	let currentCards = [];
	beforeEach( () => {
		nock.cleanAll();
		currentCards = [ card ];
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => currentCards );
		nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/me/stored-cards/${ card.stored_details_id }/delete` )
			.reply( 200, () => {
				currentCards = [];
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/me/payment-methods/${ card.stored_details_id }/is-backup` )
			.reply( 200 );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/me/payment-methods/${ card.stored_details_id }/tax-location` )
			.reply( 200 );
	} );

	it( 'lists all payment methods', async () => {
		const store = createReduxStore();
		const queryClient = new QueryClient();
		render(
			<ReduxProvider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<PaymentMethodList addPaymentMethodUrl="" />
				</QueryClientProvider>
			</ReduxProvider>
		);
		expect( await screen.findByText( `Mastercard ****${ card.card_last_4 }` ) ).toBeInTheDocument();
	} );

	it( 'removes the card when deletion completes', async () => {
		const user = userEvent.setup();
		const store = createReduxStore();
		const queryClient = new QueryClient();
		render(
			<ReduxProvider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<PaymentMethodList addPaymentMethodUrl="" />
				</QueryClientProvider>
			</ReduxProvider>
		);
		await user.click( await screen.findByText( 'Delete this payment method' ) );
		// Click confimation.
		await user.click( await screen.findByText( 'Delete' ) );
		await waitForElementToBeRemoved( () => screen.queryByText( card.name ) );
		expect( screen.queryByText( `Mastercard ****${ card.card_last_4 }` ) ).not.toBeInTheDocument();
	} );
} );
