/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import { MarketplaceTypeContext } from '../../context';
import Checkout from '../index';
import type { ReactNode } from 'react';

let mockIsApproved = true;
let mockIsBdEnabled = false;
const mockCheckoutV2 = jest.fn( () => <div data-testid="checkout-v2" /> );
const mockCheckoutV1 = jest.fn( () => <div data-testid="checkout-v1" /> );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => mockIsBdEnabled,
} ) );
jest.mock( '@automattic/calypso-router', () => ( { redirect: jest.fn() } ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: () => unknown ) => selector(),
} ) );
jest.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	hasApprovedAgencyStatus: () => mockIsApproved,
} ) );
jest.mock( '../../hoc/with-marketplace-providers', () => ( {
	__esModule: true,
	default: ( Component: ( props: unknown ) => ReactNode ) => Component,
} ) );
jest.mock( '../checkout-v2', () => ( {
	__esModule: true,
	default: ( props: unknown ) => mockCheckoutV2( props ),
} ) );
jest.mock( '../checkout-v1', () => ( {
	__esModule: true,
	default: () => mockCheckoutV1(),
} ) );

const readyRequest = {
	status: 'ready' as const,
	request: {
		source: {
			id: 'pressable_titan',
			endpoint: '/agency/pressable/titan-checkout',
			requiredParams: [],
			optionalParams: [],
		},
		params: {},
	},
};

function renderCheckout( ui: ReactNode ) {
	return render(
		<MarketplaceTypeContext.Provider
			value={ {
				marketplaceType: 'regular',
				toggleMarketplaceType: jest.fn(),
				setMarketplaceType: jest.fn(),
			} }
		>
			{ ui }
		</MarketplaceTypeContext.Provider>
	);
}

describe( 'Checkout route component', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsApproved = true;
		mockIsBdEnabled = false;
	} );

	it( 'renders the legacy checkout when the BD flag is off and no prepared request exists', () => {
		renderCheckout( <Checkout preparedRequest={ { status: 'none' } } /> );
		expect( screen.getByTestId( 'checkout-v1' ) ).toBeVisible();
	} );

	it( 'renders the Billing Dragon checkout for a prepared request even with the flag off', () => {
		renderCheckout( <Checkout preparedRequest={ readyRequest } /> );
		expect( screen.getByTestId( 'checkout-v2' ) ).toBeVisible();
		expect( mockCheckoutV2 ).toHaveBeenCalledWith(
			expect.objectContaining( { preparedRequest: readyRequest } )
		);
	} );

	it( 'renders the Billing Dragon checkout for a reload of a prepared checkout', () => {
		renderCheckout( <Checkout preparedRequest={ { status: 'reload' } } /> );
		expect( screen.getByTestId( 'checkout-v2' ) ).toBeVisible();
	} );

	it( 'shows an error instead of redirecting when the agency is unapproved in prepared mode', () => {
		mockIsApproved = false;
		renderCheckout( <Checkout preparedRequest={ readyRequest } /> );
		expect( page.redirect ).not.toHaveBeenCalled();
		expect( screen.getByText( 'Your agency is not approved for purchases yet.' ) ).toBeVisible();
	} );

	it( 'still redirects an unapproved agency in normal mode', () => {
		mockIsApproved = false;
		renderCheckout( <Checkout preparedRequest={ { status: 'none' } } /> );
		expect( page.redirect ).toHaveBeenCalledWith( '/marketplace' );
	} );
} );
