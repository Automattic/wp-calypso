/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PressableTitanCheckout from '../index';
import type { ReactNode } from 'react';

const mockDispatch = jest.fn();
const mockMutate = jest.fn();

// The hook result is replaced per test to drive the pending / success / error states.
let mockHookResult: {
	mutate: jest.Mock;
	status: 'idle' | 'pending' | 'success' | 'error';
	data?: { checkout_url: string };
	error?: { code: string; message: string };
};

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

jest.mock(
	'calypso/a8c-for-agencies/data/marketplace/use-prepare-pressable-titan-checkout',
	() => ( {
		__esModule: true,
		default: () => mockHookResult,
	} )
);

// The A4A layout chrome pulls in the whole app; render children only.
jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification', () => ( {
	__esModule: true,
	default: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/layout/hosting-dashboard/body', () => ( {
	__esModule: true,
	default: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/layout/hosting-dashboard/header', () => ( {
	__esModule: true,
	default: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
	LayoutHeaderTitle: ( { children }: { children: ReactNode } ) => <h1>{ children }</h1>,
} ) );

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const SIGNED_QUERY =
	'?agency_id=256533027&domain=titantest7.blog&plan=standard&quantity=2&signature=abc123';

function setLocation( search: string ) {
	window.history.replaceState( {}, '', '/marketplace/pressable/titan-checkout' + search );
}

describe( 'PressableTitanCheckout', () => {
	const originalLocation = window.location;
	let replace: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockHookResult = { mutate: mockMutate, status: 'idle' };
		replace = jest.fn();
		// jsdom's location.replace is not spy-able; swap the object but keep href/search live.
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: {
				replace,
				get href() {
					return originalLocation.href;
				},
				get search() {
					return originalLocation.search;
				},
			},
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { configurable: true, value: originalLocation } );
	} );

	it( 'forwards the signed query params to the endpoint exactly once, as received', () => {
		setLocation( SIGNED_QUERY );

		const { rerender } = render( <PressableTitanCheckout /> );
		rerender( <PressableTitanCheckout /> );

		expect( mockMutate ).toHaveBeenCalledTimes( 1 );
		expect( mockMutate ).toHaveBeenCalledWith( {
			agency_id: '256533027',
			domain: 'titantest7.blog',
			plan: 'standard',
			quantity: '2',
			signature: 'abc123',
		} );
	} );

	it( 'includes is_trial only when Pressable sent it', () => {
		setLocation( SIGNED_QUERY + '&is_trial=1' );

		render( <PressableTitanCheckout /> );

		expect( mockMutate ).toHaveBeenCalledWith( expect.objectContaining( { is_trial: '1' } ) );
	} );

	it( 'shows an error and never calls the endpoint when the signature is missing', () => {
		setLocation( '?agency_id=256533027&domain=titantest7.blog&quantity=2' );

		render( <PressableTitanCheckout /> );

		expect( mockMutate ).not.toHaveBeenCalled();
		expect( screen.getByText( 'This checkout link is incomplete.' ) ).toBeInTheDocument();
	} );

	it( 'navigates to the checkout URL returned by the endpoint', () => {
		setLocation( SIGNED_QUERY );
		mockHookResult = {
			mutate: mockMutate,
			status: 'success',
			data: { checkout_url: 'https://agencies.automattic.com/marketplace/checkout' },
		};

		render( <PressableTitanCheckout /> );

		expect( replace ).toHaveBeenCalledWith(
			'https://agencies.automattic.com/marketplace/checkout'
		);
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_pressable_titan_checkout_prepared',
			expect.objectContaining( { agency_id: '256533027', domain: 'titantest7.blog' } )
		);
	} );

	it( 'shows the endpoint error message and does not navigate', () => {
		setLocation( SIGNED_QUERY );
		mockHookResult = {
			mutate: mockMutate,
			status: 'error',
			error: {
				code: 'titan_unauthorized_buyer',
				message: 'Only the agency owner can buy Titan inboxes.',
			},
		};

		render( <PressableTitanCheckout /> );

		expect( replace ).not.toHaveBeenCalled();
		expect(
			screen.getByText( 'Only the agency owner can buy Titan inboxes.' )
		).toBeInTheDocument();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_pressable_titan_checkout_failed',
			expect.objectContaining( { error_code: 'titan_unauthorized_buyer' } )
		);
	} );
} );
