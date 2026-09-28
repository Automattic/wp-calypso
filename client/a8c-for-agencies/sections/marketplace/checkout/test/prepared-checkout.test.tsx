/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PreparedCheckout from '../prepared-checkout';
import type { PreparedCheckoutRequestResult } from '../../lib/prepared-checkout/get-prepared-checkout-request';

const mockDispatch = jest.fn();
const mockMutate = jest.fn();

let mockHookResult: {
	mutate: jest.Mock;
	status: 'idle' | 'pending' | 'success' | 'error';
	data?: {
		cart_key: 'no-site';
		products: Array< { product_id: number; quantity: number } >;
		details: object;
	};
	error?: { code: string; message: string; status: number };
};

const mockBillingDragonCheckout = jest.fn( () => <div data-testid="bd-checkout" /> );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );
jest.mock( 'calypso/a8c-for-agencies/data/marketplace/use-prepare-checkout', () => ( {
	__esModule: true,
	default: () => mockHookResult,
} ) );
jest.mock( '../../billing-dragon-checkout', () => ( {
	__esModule: true,
	default: ( props: unknown ) => mockBillingDragonCheckout( props ),
} ) );

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const source = {
	id: 'pressable_titan',
	endpoint: '/agency/pressable/titan-checkout',
	requiredParams: [ 'agency_id', 'domain', 'quantity', 'signature' ],
	optionalParams: [ 'plan', 'is_trial' ],
};
const params = {
	agency_id: '256533027',
	domain: 'titantest7.blog',
	quantity: '2',
	signature: 'abc123',
};
const ready: PreparedCheckoutRequestResult = { status: 'ready', request: { source, params } };

describe( 'PreparedCheckout', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHookResult = { mutate: mockMutate, status: 'idle' };
		window.history.replaceState(
			{},
			'',
			'/marketplace/checkout?prepare=pressable_titan&agency_id=256533027&domain=titantest7.blog&quantity=2&signature=abc123'
		);
	} );

	it( 'prepares exactly once on mount with the request and shows the placeholder', () => {
		const { container, rerender } = render( <PreparedCheckout request={ ready } /> );
		rerender( <PreparedCheckout request={ ready } /> );

		expect( mockMutate ).toHaveBeenCalledTimes( 1 );
		expect( mockMutate ).toHaveBeenCalledWith( { source, params } );
		expect( container.querySelector( '.client-checkout-placeholder' ) ).not.toBeNull();
		expect( mockBillingDragonCheckout ).not.toHaveBeenCalled();
	} );

	it( 'on success rewrites the URL to skip_active_cart=1 and renders the checkout in prepared mode', () => {
		mockHookResult = {
			mutate: mockMutate,
			status: 'success',
			data: {
				cart_key: 'no-site',
				products: [ { product_id: 1234, quantity: 2 } ],
				details: {},
			},
		};
		render( <PreparedCheckout request={ ready } /> );

		expect( window.location.pathname + window.location.search ).toBe(
			'/marketplace/checkout?skip_active_cart=1'
		);
		expect( screen.getByTestId( 'bd-checkout' ) ).toBeVisible();
		expect( mockBillingDragonCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( {
				cartItems: [],
				withA8cLogo: false,
				shouldClearCartOnSuccess: false,
				preparedCart: {
					products: [ { product_id: 1234, quantity: 2 } ],
					source: 'pressable_titan',
				},
			} )
		);
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_prepared_checkout_prepared',
			{ source: 'pressable_titan' }
		);
	} );

	it( 'on failure shows the endpoint message and records the event', () => {
		mockHookResult = {
			mutate: mockMutate,
			status: 'error',
			error: {
				status: 403,
				code: 'titan_unauthorized_buyer',
				message: 'Only the agency owner can buy Titan inboxes.',
			},
		};
		render( <PreparedCheckout request={ ready } /> );

		expect( screen.getByText( 'We could not prepare this checkout.' ) ).toBeVisible();
		expect( screen.getByText( 'Only the agency owner can buy Titan inboxes.' ) ).toBeVisible();
		expect( screen.queryByTestId( 'bd-checkout' ) ).toBeNull();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_prepared_checkout_failed',
			{ source: 'pressable_titan', error_code: 'titan_unauthorized_buyer' }
		);
	} );

	it( 'reload: renders the checkout in prepared mode without preparing again', () => {
		window.history.replaceState( {}, '', '/marketplace/checkout?skip_active_cart=1' );
		render( <PreparedCheckout request={ { status: 'reload' } } /> );

		expect( mockMutate ).not.toHaveBeenCalled();
		expect( mockBillingDragonCheckout ).toHaveBeenCalledWith(
			expect.objectContaining( { preparedCart: { source: 'reload' } } )
		);
	} );

	it( 'incomplete link: shows an error without calling the endpoint', () => {
		render(
			<PreparedCheckout request={ { status: 'incomplete', source, missing: [ 'signature' ] } } />
		);
		expect( mockMutate ).not.toHaveBeenCalled();
		expect( screen.getByText( 'This checkout link is incomplete.' ) ).toBeVisible();
	} );

	it( 'unknown source: shows an error without calling the endpoint', () => {
		render( <PreparedCheckout request={ { status: 'unknown_source', sourceId: 'nope' } } /> );
		expect( mockMutate ).not.toHaveBeenCalled();
		expect( screen.getByText( 'This checkout link is not supported.' ) ).toBeVisible();
	} );
} );
