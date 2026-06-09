/**
 * @jest-environment jsdom
 */
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { type ComponentType } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createTestReduxStore } from 'calypso/my-sites/checkout/src/test/util';
import { getFieldDefinitions } from '../field-definitions';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

const item: BillingTransactionItem = {
	id: '1',
	type: 'refund',
	type_localized: 'Refund',
	domain: '',
	site_id: '1',
	subtotal: '',
	raw_subtotal: 0,
	subtotal_integer: 0,
	tax: '',
	raw_tax: 0,
	tax_integer: 0,
	amount: '',
	raw_amount: 0,
	amount_integer: 9600,
	cost_overrides: [],
	currency: 'USD',
	licensed_quantity: 0,
	new_quantity: 0,
	product: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	variation: 'WordPress.com Personal',
	variation_slug: '',
	months_per_renewal_interval: 12,
	wpcom_product_slug: 'personal-bundle',
	volume: 0,
} as unknown as BillingTransactionItem;

const transaction: BillingTransaction = {
	address: '',
	amount: '',
	amount_integer: 9600,
	currency: 'USD',
	tax_country_code: 'US',
	cc_email: '',
	cc_name: '',
	cc_num: '',
	cc_type: '',
	cc_display_brand: null,
	credit: '',
	date: '2026-05-21T00:00:00+00:00',
	desc: '',
	icon: '',
	id: '1',
	items: [ item ],
	org: '',
	pay_part: '',
	pay_ref: '',
	service: 'WordPress.com',
	service_slug: 'wpcom',
	subtotal: '',
	subtotal_integer: 9600,
	support: '',
	tax: '',
	tax_integer: 0,
	url: '',
} as unknown as BillingTransaction;

function renderServiceCell( visibleFields: string[] ) {
	const translate = ( ( text: string ) => text ) as never;
	const fields = getFieldDefinitions( [ transaction ], translate, () => '/r/1', visibleFields );
	const serviceField = fields.find( ( field ) => field.id === 'service' )!;
	const ServiceCell = serviceField.render as ComponentType< { item: BillingTransaction } >;
	const queryClient = new QueryClient();
	const store = createTestReduxStore();
	return render(
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ServiceCell item={ transaction } />
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( 'billing history service cell inline fields', () => {
	it( 'shows Type and Amount inline when those columns are hidden', () => {
		renderServiceCell( [ 'date', 'service' ] );
		expect( screen.getByText( 'Type' ) ).toBeVisible();
		expect( screen.getByText( 'Refund' ) ).toBeVisible();
		expect( screen.getByText( 'Amount' ) ).toBeVisible();
		expect( screen.getByText( '$96' ) ).toBeVisible();
		expect( screen.queryByText( 'Date' ) ).not.toBeInTheDocument();
	} );

	it( 'shows Date inline when only the App column is visible', () => {
		renderServiceCell( [ 'service' ] );
		expect( screen.getByText( 'Date' ) ).toBeVisible();
		expect( screen.getByText( 'May 21, 2026' ) ).toBeVisible();
		expect( screen.getByText( 'Type' ) ).toBeVisible();
		expect( screen.getByText( 'Refund' ) ).toBeVisible();
		expect( screen.getByText( 'Amount' ) ).toBeVisible();
		expect( screen.getByText( '$96' ) ).toBeVisible();
	} );

	it( 'shows no inline lines when all columns are visible', () => {
		renderServiceCell( [ 'date', 'service', 'type', 'amount' ] );
		expect( screen.queryByText( 'Type' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Amount' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Date' ) ).not.toBeInTheDocument();
	} );
} );
