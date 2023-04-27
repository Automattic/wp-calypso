/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PaymentMethodList from '../payment-method-list';
import type {
	StoredPaymentMethodCard,
	StoredPaymentMethodPayPal,
} from '../../../../lib/checkout/payment-methods';

const card: StoredPaymentMethodCard = {
	stored_details_id: '1234',
	user_id: '5432',
	name: 'Card Person',
	country_code: 'US',
	payment_partner: 'stripe',
	payment_partner_reference: '',
	payment_partner_source_id: '',
	mp_ref: 'mock-mp-ref-1',
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

const payPalAgreement: StoredPaymentMethodPayPal = {
	stored_details_id: '1235',
	user_id: '5432',
	name: 'PayPal Person',
	country_code: 'US',
	payment_partner: 'paypal_express',
	payment_partner_reference: '',
	payment_partner_source_id: '',
	mp_ref: 'mock-mp-ref-2',
	email: '',
	card_expiry_year: '',
	card_expiry_month: '',
	expiry: '0000-00-00',
	remember: true,
	source: '',
	original_stored_details_id: '',
	is_rechargable: true,
	payment_type: '',
	is_expired: false,
	is_backup: false,
	tax_location: null,
};

describe( 'PaymentMethod', () => {
	const currentData = { cards: [] };
	beforeEach( () => {
		nock.cleanAll();
		currentData.cards = [ card, payPalAgreement ];
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => currentData.cards );
		nock( 'https://public-api.wordpress.com' )
			.post( new RegExp( '/rest/v1.1/me/stored-cards/\\d+/delete' ) )
			.reply( 200, ( uri ) => {
				const matches = uri.match( new RegExp( '/stored-cards/(\\d+)/delete' ) );
				const id = matches[ 1 ];
				currentData.cards = currentData.cards.filter(
					( oneCard ) => oneCard.stored_details_id !== id
				);
			} );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.1/me/payment-methods/\\d+/is-backup' ) )
			.reply( 200 );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.1/me/payment-methods/\\d+/tax-location' ) )
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
		expect( await screen.findByText( payPalAgreement.name ) ).toBeInTheDocument();
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
		await user.click(
			await screen.findByLabelText( `Delete the "${ card.card_last_4 }" payment method` )
		);
		// Click confimation.
		await user.click( await screen.findByText( 'Delete' ) );
		await waitForElementToBeRemoved( () => screen.queryByText( card.name ) );
		expect( screen.queryByText( `Mastercard ****${ card.card_last_4 }` ) ).not.toBeInTheDocument();
		expect( await screen.findByText( payPalAgreement.name ) ).toBeInTheDocument();
	} );

	it( 'removes the PayPal agreement when deletion completes', async () => {
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
		expect( await screen.findByText( `Mastercard ****${ card.card_last_4 }` ) ).toBeInTheDocument();
		await user.click(
			await screen.findByLabelText( `Delete the "${ payPalAgreement.name }" payment method` )
		);
		// Click confimation.
		await user.click( await screen.findByText( 'Delete' ) );
		await waitForElementToBeRemoved( () => screen.queryByText( payPalAgreement.name ) );
		expect( screen.queryByText( payPalAgreement.name ) ).not.toBeInTheDocument();
		expect( await screen.findByText( `Mastercard ****${ card.card_last_4 }` ) ).toBeInTheDocument();
	} );
} );
