/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { FailedPurchasePage } from '../failed-purchase-page';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

const mockReceiptQuery = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	receiptQuery: ( receiptId: number, options: unknown ) => mockReceiptQuery( receiptId, options ),
} ) );

jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => () => <div data-testid="loading" /> );

// Capture the props the page hands to the details component — that mapping is
// the logic under test.
const mockFailedPurchaseDetails = jest.fn();
jest.mock( '../failed-purchase-details', () => ( props: unknown ) => {
	mockFailedPurchaseDetails( props );
	return <div data-testid="failed-purchase-details" />;
} );

type QueryResult = { data?: unknown; isLoading?: boolean };

function setupUseQuery( response: QueryResult = {} ) {
	mockUseQuery.mockReturnValue( {
		data: response.data,
		isLoading: response.isLoading ?? false,
	} );
}

function setSearch( search: string ) {
	window.history.pushState( {}, '', `/checkout/failed-purchases${ search }` );
}

beforeEach( () => {
	jest.clearAllMocks();
	mockReceiptQuery.mockReturnValue( { queryKey: [ 'receipt' ], queryFn: jest.fn() } );
	setSearch( '' );
} );

describe( 'FailedPurchasePage', () => {
	it( 'requests the receipt with failed purchases included, keyed on the receipt_id query param', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( { data: undefined } );

		render( <FailedPurchasePage /> );

		expect( mockReceiptQuery ).toHaveBeenCalledWith( 12345, { includeFailedPurchases: true } );
	} );

	it( 'shows the loading state while the receipt is being fetched', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( { isLoading: true } );

		render( <FailedPurchasePage /> );

		expect( screen.getByTestId( 'loading' ) ).toBeVisible();
		expect( screen.queryByTestId( 'failed-purchase-details' ) ).not.toBeInTheDocument();
	} );

	it( 'does not show the loading state when there is no receipt_id, even while loading', () => {
		setSearch( '' );
		setupUseQuery( { isLoading: true } );

		render( <FailedPurchasePage /> );

		expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'failed-purchase-details' ) ).toBeVisible();
		expect( mockFailedPurchaseDetails ).toHaveBeenCalledWith( {
			failedPurchases: undefined,
			purchases: undefined,
		} );
	} );

	it( 'maps successful items and flattens failed purchases across sites', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( {
			data: {
				items: [
					{ id: 1, product: 'WordPress.com Personal', variation: 'Annual' },
					{ id: 2, product: 'Domain', variation: 'example.com' },
				],
				failed_purchases: {
					100: [
						{
							product_id: 50,
							product_name: 'Failed Plugin',
							product_slug: 'failed-plugin',
							product_cost: '25',
							product_meta: 'meta-a',
						},
					],
					200: [
						{
							product_id: 60,
							product_name: 'Failed Theme',
							product_slug: 'failed-theme',
							product_cost: 10,
							product_meta: 'meta-b',
						},
					],
				},
			},
		} );

		render( <FailedPurchasePage /> );

		expect( mockFailedPurchaseDetails ).toHaveBeenCalledWith( {
			purchases: [
				{ productId: 1, productName: 'WordPress.com Personal', meta: 'Annual' },
				{ productId: 2, productName: 'Domain', meta: 'example.com' },
			],
			failedPurchases: [
				{
					productId: 50,
					productName: 'Failed Plugin',
					productSlug: 'failed-plugin',
					productCost: '25',
					meta: 'meta-a',
				},
				{
					productId: 60,
					productName: 'Failed Theme',
					productSlug: 'failed-theme',
					productCost: 10,
					meta: 'meta-b',
				},
			],
		} );
	} );

	it( 'passes undefined failedPurchases when the receipt reports none', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( {
			data: {
				items: [ { id: 1, product: 'WordPress.com Personal', variation: 'Annual' } ],
			},
		} );

		render( <FailedPurchasePage /> );

		expect( mockFailedPurchaseDetails ).toHaveBeenCalledWith( {
			purchases: [ { productId: 1, productName: 'WordPress.com Personal', meta: 'Annual' } ],
			failedPurchases: undefined,
		} );
	} );
} );
