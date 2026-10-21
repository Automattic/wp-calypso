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

	it( 'labels successful items by their variation and flattens failed purchases across sites', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( {
			data: {
				items: [
					{
						id: 1,
						product: 'wp-bundles',
						variation: 'WordPress.com Premium',
						wpcom_product_slug: 'value_bundle',
						domain: 'example.wordpress.com',
					},
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
				{ productId: 1, productName: 'WordPress.com Premium', meta: 'example.wordpress.com' },
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

	it( 'excludes a failed item and its orphaned domain connection from the success list', () => {
		// Mirrors a real partial-failure receipt: a plan succeeds, the .blog
		// registration fails, and its domain connection is left orphaned. The failed
		// registration and connection still appear in `items`, so both must be filtered.
		setSearch( '?receipt_id=20691080' );
		setupUseQuery( {
			data: {
				items: [
					{
						id: 1,
						product: 'wp-bundles',
						variation: 'WordPress.com Premium',
						wpcom_product_slug: 'value_bundle',
						domain: 'eamartin.wordpress.com',
					},
					{
						id: 2,
						product: 'Domain',
						variation: '.blog Domain Registration',
						wpcom_product_slug: 'dotblog_domain',
						domain: 'eamartin.blog',
					},
					{
						id: 3,
						product: 'Domain',
						variation: 'Domain Connection',
						wpcom_product_slug: 'domain_map',
						domain: 'eamartin.blog',
					},
				],
				failed_purchases: {
					6144760: [
						{
							product_id: 76,
							product_name: '.blog Domain Registration',
							product_slug: 'dotblog_domain',
							product_cost: 21,
							product_meta: 'eamartin.blog',
						},
					],
				},
			},
		} );

		render( <FailedPurchasePage /> );

		expect( mockFailedPurchaseDetails ).toHaveBeenCalledWith( {
			purchases: [
				{ productId: 1, productName: 'WordPress.com Premium', meta: 'eamartin.wordpress.com' },
			],
			failedPurchases: [
				{
					productId: 76,
					productName: '.blog Domain Registration',
					productSlug: 'dotblog_domain',
					productCost: 21,
					meta: 'eamartin.blog',
				},
			],
		} );
	} );

	it( 'passes undefined failedPurchases when the receipt reports none', () => {
		setSearch( '?receipt_id=12345' );
		setupUseQuery( {
			data: {
				items: [
					{
						id: 1,
						product: 'wp-bundles',
						variation: 'WordPress.com Premium',
						wpcom_product_slug: 'value_bundle',
						domain: 'example.wordpress.com',
					},
				],
			},
		} );

		render( <FailedPurchasePage /> );

		expect( mockFailedPurchaseDetails ).toHaveBeenCalledWith( {
			purchases: [
				{ productId: 1, productName: 'WordPress.com Premium', meta: 'example.wordpress.com' },
			],
			failedPurchases: undefined,
		} );
	} );
} );
