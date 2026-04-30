/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Test fixtures only include the fields used by this component.
import page from '@automattic/calypso-router';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { recordPostPurchaseTracking } from 'calypso/lib/analytics/ad-tracking/record-post-purchase';
import usePurchaseOrder from 'calypso/my-sites/checkout/src/hooks/use-purchase-order';
import { CheckoutPending } from '../index';

jest.mock( '@automattic/api-queries', () => ( {
	receiptQuery: jest.fn( ( receiptId ) => ( {
		queryKey: [ 'receipt', receiptId ],
		queryFn: jest.fn(),
	} ) ),
} ) );

jest.mock( '@automattic/calypso-router' );

jest.mock( '@automattic/composite-checkout', () => ( {
	CheckoutErrorBoundary: ( { children } ) => children,
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		Loading: () => null,
	},
} ) );

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: jest.fn(),
} ) );

jest.mock( '@automattic/survicate', () => ( {
	invokeSurvicateEvent: jest.fn(),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => {
	const translate = ( text ) => text;
	return {
		localize: ( component ) => component,
		translate,
		useTranslate: () => translate,
	};
} );

jest.mock( 'calypso/components/loading', () => () => null );

jest.mock( 'calypso/components/main', () => ( { children } ) => <main>{ children }</main> );

jest.mock( 'calypso/layout/utils', () => ( {
	useInitialIsInStepContainerV2FlowContext: () => false,
} ) );

jest.mock( 'calypso/lib/analytics/ad-tracking/record-post-purchase', () => ( {
	isPostPurchaseWpcomGoogleAdsEnabled: jest.fn( () => true ),
	recordPostPurchaseTracking: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );

jest.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => ( {
	__esModule: true,
	default: ( { children } ) => children,
} ) );

jest.mock( 'calypso/my-sites/checkout/src/lib/analytics', () => ( {
	logStashLoadErrorEvent: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/checkout/src/hooks/use-purchase-order', () => jest.fn() );

jest.mock( 'calypso/my-sites/checkout/src/lib/popup', () => ( {
	sendMessageToOpener: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => jest.fn( () => 'cart-key' ) );

jest.mock( 'calypso/state', () => {
	const dispatch = jest.fn();
	return {
		useDispatch: jest.fn( () => dispatch ),
		useSelector: jest.fn( ( selector ) => selector( {} ) ),
	};
} );

jest.mock( 'calypso/state/current-user/actions', () => ( {
	fetchCurrentUser: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn(),
	successNotice: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-order-transaction-error', () => jest.fn( () => null ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn(),
} ) );

const reloadCart = jest.fn( () => Promise.resolve() );

const makeCart = ( totalCost: number ) => ( {
	total_cost: totalCost,
	currency: 'USD',
	is_signup: false,
	products: [],
} );

const makeReceipt = () => ( {
	id: 12345,
	amount_integer: 2500,
	currency: 'USD',
	items: [],
} );

describe( 'CheckoutPending post-purchase tracking', () => {
	let queryResult;
	let responseCart;

	beforeEach( () => {
		jest.clearAllMocks();
		queryResult = {
			data: undefined,
			isSuccess: false,
			isError: false,
		};
		responseCart = makeCart( 12.34 );
		( useQuery as jest.Mock ).mockImplementation( () => queryResult );
		( useShoppingCart as jest.Mock ).mockImplementation( () => ( {
			responseCart,
			reloadFromServer: reloadCart,
		} ) );
		( usePurchaseOrder as jest.Mock ).mockReturnValue( {
			isLoading: false,
			order: null,
		} );
	} );

	it( 'does not reload the cart again when only the live cart changes while waiting for the receipt', async () => {
		const { rerender } = render(
			<CheckoutPending orderId=":orderId" receiptId={ 12345 } redirectTo="/done" />
		);

		await waitFor( () => expect( reloadCart ).toHaveBeenCalledTimes( 1 ) );

		responseCart = makeCart( 0 );
		rerender( <CheckoutPending orderId=":orderId" receiptId={ 12345 } redirectTo="/done" /> );

		expect( reloadCart ).toHaveBeenCalledTimes( 1 );
		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
		expect( page ).not.toHaveBeenCalled();
	} );

	it( 'uses the captured cart snapshot when receipt loading fails before redirecting', async () => {
		const capturedCart = responseCart;
		const { rerender } = render(
			<CheckoutPending orderId=":orderId" receiptId={ 12345 } redirectTo="/done" />
		);

		await waitFor( () => expect( reloadCart ).toHaveBeenCalledTimes( 1 ) );

		responseCart = makeCart( 0 );
		queryResult = {
			data: undefined,
			isSuccess: false,
			isError: true,
		};
		rerender( <CheckoutPending orderId=":orderId" receiptId={ 12345 } redirectTo="/done" /> );

		await waitFor( () =>
			expect( recordPostPurchaseTracking ).toHaveBeenCalledWith( {
				receiptId: 12345,
				receipt: undefined,
				cart: capturedCart,
				source: 'checkout-pending',
			} )
		);
		expect( page ).toHaveBeenCalledWith( '/done' );
	} );

	it( 'redirects when post-purchase tracking throws', async () => {
		( recordPostPurchaseTracking as jest.Mock ).mockImplementation( () => {
			throw new Error( 'tracking failed' );
		} );
		queryResult = {
			data: makeReceipt(),
			isSuccess: true,
			isError: false,
		};

		render( <CheckoutPending orderId=":orderId" receiptId={ 12345 } redirectTo="/done" /> );

		await waitFor( () => expect( page ).toHaveBeenCalledWith( '/done' ) );
	} );
} );
