/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { act, render, waitFor } from '@testing-library/react';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	retrieveSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import CheckoutPending from '..';
import { recordCompletedPurchaseAnalytics } from '../../../src/lib/record-completed-purchase-analytics';
import type { ReactNode } from 'react';

const mockReceipt = {
	id: 1,
	checkout_type: 'default',
	items: [
		{ site_id: 42, is_plan: true, type: 'new purchase', wpcom_product_slug: 'business-bundle' },
	],
};
const mockQueryClient = { invalidateQueries: jest.fn() };
const mockReloadCart = jest.fn().mockResolvedValue( undefined );
const mockDispatch = jest.fn();
let mockUserId: number | null = null;

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: () => ( { data: mockReceipt, isSuccess: true, isError: false } ),
	useQueryClient: () => mockQueryClient,
} ) );
jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: () => ( { reloadFromServer: mockReloadCart } ),
} ) );
jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/survicate', () => ( { invokeSurvicateEvent: jest.fn() } ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: () => mockUserId,
} ) );
jest.mock( 'calypso/state/current-user/actions', () => ( {
	fetchCurrentUser: jest.fn( () => ( { type: 'FETCH_CURRENT_USER' } ) ),
} ) );
jest.mock( 'calypso/state/query-client', () => ( { getCalypsoQueryClient: () => undefined } ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 'no-user' );
jest.mock( 'calypso/my-sites/checkout/src/hooks/use-purchase-order', () => () => ( {
	isLoading: false,
} ) );
jest.mock( 'calypso/my-sites/checkout/src/lib/pending-page', () => ( {
	getRedirectFromPendingPage: ( { redirectTo }: { redirectTo: string } ) => ( {
		url: redirectTo,
		isError: false,
		isUnknown: false,
	} ),
} ) );
jest.mock( 'calypso/my-sites/checkout/src/lib/record-completed-purchase-analytics', () => ( {
	recordCompletedPurchaseAnalytics: jest.fn().mockResolvedValue( undefined ),
} ) );
jest.mock(
	'calypso/my-sites/checkout/calypso-shopping-cart-provider',
	() =>
		( { children }: { children: ReactNode } ) =>
			children
);
jest.mock(
	'calypso/components/main',
	() =>
		( { children }: { children: ReactNode } ) =>
			children
);
jest.mock( 'calypso/components/loading', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/layout/utils', () => ( {
	useInitialIsInStepContainerV2FlowContext: () => false,
} ) );

describe( 'static site signup after checkout', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.sessionStorage.clear();
		clearSignupDestinationCookie();
		mockReceipt.checkout_type = 'default';
		mockUserId = null;
	} );

	it( 'refreshes the new user before tracking and redirecting a default checkout receipt', async () => {
		setSignupCompleteFlowName( 'static-site-import' );
		setSignupCompleteSiteID( '42' );
		persistSignupDestination(
			'/setup/static-site-import/static-site-import-reading?siteId=:siteId'
		);
		let finishUserRefresh!: () => void;
		mockDispatch.mockReturnValue(
			new Promise< void >( ( resolve ) => {
				finishUserRefresh = resolve;
			} )
		);

		render(
			<CheckoutPending
				orderId=":orderId"
				receiptId={ 1 }
				redirectTo="/setup/static-site-import/static-site-import-reading?siteId=:siteId"
			/>
		);

		expect( fetchCurrentUser ).toHaveBeenCalledTimes( 1 );
		expect( recordCompletedPurchaseAnalytics ).not.toHaveBeenCalled();
		expect( page ).not.toHaveBeenCalled();

		await act( async () => {
			mockUserId = 123;
			finishUserRefresh();
		} );

		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith(
				'/setup/static-site-import/static-site-import-reading?siteId=42'
			)
		);
		expect( recordCompletedPurchaseAnalytics ).toHaveBeenCalledWith( mockReceipt, {
			flow: 'static-site-import',
			userId: 123,
		} );
		expect( retrieveSignupDestination() ).toBe(
			'/setup/static-site-import/static-site-import-reading?siteId=42'
		);
	} );

	it.each( [
		{ checkoutType: 'unified', savedDestination: true, shouldResolve: true },
		{ checkoutType: 'default', savedDestination: true, shouldResolve: false },
		{ checkoutType: 'unified', savedDestination: false, shouldResolve: false },
	] )(
		'resolves only a saved return for a checkout-created site: %j',
		async ( { checkoutType, savedDestination, shouldResolve } ) => {
			mockReceipt.checkout_type = checkoutType;
			mockUserId = 123;
			mockDispatch.mockResolvedValue( undefined );
			setSignupCompleteFlowName( 'static-site-import' );
			const redirectTo =
				'/setup/static-site-import/static-site-import-reading?siteId=:siteId&applySiteSettings=1';
			if ( savedDestination ) {
				persistSignupDestination( redirectTo );
			}

			render( <CheckoutPending orderId=":orderId" receiptId={ 1 } redirectTo={ redirectTo } /> );

			await waitFor( () => expect( page ).toHaveBeenCalled() );
			const unresolvedDestination = savedDestination ? redirectTo : undefined;
			expect( retrieveSignupDestination() ).toBe(
				shouldResolve ? redirectTo.replace( ':siteId', '42' ) : unresolvedDestination
			);
		}
	);
} );
