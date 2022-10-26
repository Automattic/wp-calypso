/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react-hooks';
import nock from 'nock';
import { setLogger, QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch } from 'react-redux';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import {
	LicenseSortDirection,
	LicenseSortField,
	LicenseState,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import {
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
} from 'calypso/state/action-types';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import useBillingDashboardQuery from 'calypso/state/partner-portal/licenses/hooks/use-billing-dashboard-query';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import useRefreshLicenseList from 'calypso/state/partner-portal/licenses/hooks/use-refresh-license-list';
import useRevokeLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-revoke-license-mutation';
import useTOSConsentMutation from 'calypso/state/partner-portal/licenses/hooks/use-tos-consent-mutation';

jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn( () => null ),
	useSelector: () => 1,
} ) );

describe( 'useRefreshLicenseList', () => {
	it( 'returns a thunk action creator which refreshes the license list', () => {
		const stub = {
			filter: LicenseState.Revoked,
			search: 'foo',
			sortField: LicenseSortField.RevokedAt,
			sortDirection: LicenseSortDirection.Ascending,
			currentPage: 2,
		};
		const dispatch = jest.fn();
		const wrapper = ( { children } ) => (
			<LicenseListContext.Provider value={ stub }>{ children }</LicenseListContext.Provider>
		);
		const { result } = renderHook( () => useRefreshLicenseList( LicenseListContext ), {
			wrapper,
		} );

		const thunk = result.current();

		thunk( dispatch );

		expect( dispatch.mock.calls[ 0 ][ 0 ] ).toEqual( {
			type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
			filter: stub.filter,
			search: stub.search,
			sortField: stub.sortField,
			sortDirection: stub.sortDirection,
			page: stub.currentPage,
			perPage: LICENSES_PER_PAGE,
			fetcher: 'wpcomJetpackLicensing',
		} );

		expect( dispatch.mock.calls[ 1 ][ 0 ] ).toEqual( {
			type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
			fetcher: 'wpcomJetpackLicensing',
		} );
	} );
} );

describe( 'useProductsQuery', () => {
	it( 'returns filtered list of products', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const unexpected = [
			{
				name: 'Jetpack Backup',
				slug: 'jetpack-backup',
				products: [
					{
						name: 'Jetpack Backup (Daily)',
						product_id: 2100,
						slug: 'jetpack-backup-daily',
					},
					{
						name: 'Jetpack Backup (Real-time)',
						product_id: 2102,
						slug: 'jetpack-backup-realtime',
					},
					{
						name: 'Jetpack Backup (1GB)',
						product_id: 2120,
						slug: 'jetpack-backup-t0',
					},
				],
			},
			{
				name: 'Jetpack Plans',
				slug: 'jetpack-plans',
				products: [
					{
						name: 'Jetpack Personal',
						product_id: 2005,
						slug: 'personal',
					},
					{
						name: 'Jetpack Premium',
						product_id: 2000,
						slug: 'premium',
					},
					{
						name: 'Jetpack Professional',
						product_id: 2001,
						slug: 'professional',
					},
				],
			},
			{
				name: 'Jetpack Packs',
				slug: 'jetpack-packs',
				products: [
					{
						name: 'Jetpack Security Daily',
						product_id: 2010,
						slug: 'jetpack-security-daily',
					},
					{
						name: 'Jetpack Security Real-time',
						product_id: 2012,
						slug: 'jetpack-security-realtime',
					},
				],
			},
		];
		const expected = [
			{
				name: 'Jetpack Scan',
				slug: 'jetpack-scan',
				products: [
					{
						name: 'Jetpack Scan Daily',
						product_id: 2106,
						slug: 'jetpack-scan',
					},
				],
			},
			{
				name: 'Jetpack Backup',
				slug: 'jetpack-backup',
				products: [
					{
						name: 'Jetpack Backup (10GB)',
						product_id: 2112,
						slug: 'jetpack-backup-t1',
					},
					{
						name: 'Jetpack Backup (1TB)',
						product_id: 2114,
						slug: 'jetpack-backup-t2',
					},
				],
			},
			{
				name: 'Jetpack Anti Spam',
				slug: 'jetpack-anti-spam',
				products: [
					{
						name: 'Jetpack Anti-Spam',
						product_id: 2110,
						slug: 'jetpack-anti-spam',
					},
				],
			},
			{
				name: 'Jetpack Videopress',
				slug: 'jetpack-videopress',
				products: [
					{
						name: 'Jetpack VideoPress',
						product_id: 2116,
						slug: 'jetpack-videopress',
					},
				],
			},
			{
				name: 'Jetpack Packs',
				slug: 'jetpack-packs',
				products: [
					{
						name: 'Jetpack Complete',
						product_id: 2014,
						slug: 'jetpack-complete',
					},
					{
						name: 'Jetpack Security (10GB)',
						product_id: 2016,
						slug: 'jetpack-security-t1',
					},
					{
						name: 'Jetpack Security (1TB)',
						product_id: 2019,
						slug: 'jetpack-security-t2',
					},
				],
			},
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/partner/product-families' )
			.reply( 200, [ ...unexpected, ...expected ] );

		const { result, waitFor } = renderHook( () => useProductsQuery(), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( expected );
	} );

	it( 'dispatches an error notice on failure', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/partner/product-families' )
			.reply( 500, { code: 'could_not_retrieve_subscription', message: '' } );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		// Prevent console.error from being loud during testing because of the test 500 error.
		const consoleError = global.console.error;
		global.console.error = jest.fn();
		const { result, waitFor } = renderHook( () => useProductsQuery( { retry: false } ), {
			wrapper,
		} );

		// Wait for the response.
		await waitFor( () => result.current.isError );
		expect( result.current.isError ).toBe( true );
		global.console.error = consoleError;

		// Test that the correct notification is being triggered.
		expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
			'partner-portal-product-families-failure'
		);
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-error' );
	} );
} );

describe( 'useIssueLicenseMutation', () => {
	it( 'returns successful request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			issued_at: '2021-03-30 15:17:42',
			license_id: 12345,
			license_key: 'jetpack-scan_foobarbaz',
			revoked_at: null,
		};

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-licensing/license', '{"product":"jetpack-scan"}' )
			.reply( 200, stub );

		const { result } = renderHook( () => useIssueLicenseMutation(), {
			wrapper,
		} );

		await act( async () => result.current.mutateAsync( { product: 'jetpack-scan' } ) );

		expect( result.current.data ).toEqual( stub );
	} );
} );

describe( 'useRevokeLicenseMutation', () => {
	it( 'returns successful request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			issued_at: '2021-03-30 15:17:42',
			license_id: 12345,
			license_key: 'jetpack-scan_foobarbaz',
			revoked_at: null,
		};

		nock( 'https://public-api.wordpress.com' )
			.delete( '/wpcom/v2/jetpack-licensing/license', '{"license_key":"jetpack-scan_foobarbaz"}' )
			.reply( 200, stub );

		const { result } = renderHook( () => useRevokeLicenseMutation(), {
			wrapper,
		} );

		await act( async () => result.current.mutateAsync( { licenseKey: 'jetpack-scan_foobarbaz' } ) );

		expect( result.current.data ).toEqual( stub );
	} );
} );

describe( 'useTOSConsentMutation', () => {
	it( 'returns successful request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			id: 1,
			slug: 'tos-partner',
			name: 'TOS Partner',
			keys: [],
			tos: 'consented',
		};

		nock( 'https://public-api.wordpress.com' )
			.put( '/wpcom/v2/jetpack-licensing/partner', '{"tos":"consented"}' )
			.reply( 200, stub );

		const { result } = renderHook( () => useTOSConsentMutation(), {
			wrapper,
		} );

		await act( async () => result.current.mutateAsync() );

		expect( result.current.data ).toEqual( stub );
	} );
} );

describe( 'useBillingDashboardQuery', () => {
	beforeEach( () => {
		// Prevent react-query from logging an error due to the failing requests.
		setLogger( {
			error: jest.fn(),
		} );
	} );

	afterEach( () => {
		// Restore react-query logger.
		setLogger( console );
	} );

	it( 'returns transformed request data', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			date: '2021-01-01',
			products: [
				{
					product_slug: 'foo',
					product_name: 'Foo',
					product_quantity: 6,
					product_cost: 3,
					product_total_cost: 18,
					counts: {
						total: 6,
						assigned: 4,
						unassigned: 2,
					},
				},
			],
			licenses: {
				total: 3,
				assigned: 2,
				unassigned: 1,
			},
			costs: {
				total: 300,
				assigned: 200,
				unassigned: 100,
			},
			price_interval: 'month',
		};

		const formattedStub = {
			date: '2021-01-01',
			products: [
				{
					productSlug: 'foo',
					productName: 'Foo',
					productQuantity: 6,
					productCost: 3,
					productTotalCost: 18,
					counts: {
						total: 6,
						assigned: 4,
						unassigned: 2,
					},
				},
			],
			licenses: {
				total: 3,
				assigned: 2,
				unassigned: 1,
			},
			costs: {
				total: 300,
				assigned: 200,
				unassigned: 100,
			},
			priceInterval: 'month',
		};

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/licenses/billing' )
			.reply( 200, stub );

		const { result, waitFor } = renderHook( () => useBillingDashboardQuery(), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( formattedStub );
	} );

	it( 'dispatches notification on no invoice available', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/licenses/billing' )
			.reply( 403, {
				code: 'no_billing_invoice_available',
			} );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		const { result, waitFor } = renderHook( () => useBillingDashboardQuery( { retry: false } ), {
			wrapper,
		} );

		// Wait for the response.
		await waitFor( () => result.current.isError );
		expect( result.current.isError ).toBe( true );

		// Test that the correct notification is being triggered.
		expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
			'partner-portal-billing-dashboard-no-billing-invoice-available'
		);
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-plain' );
	} );

	it( 'dispatches notice on error', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/licenses/billing' )
			.reply( 403 );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		const { result, waitFor } = renderHook( () => useBillingDashboardQuery( { retry: false } ), {
			wrapper,
		} );

		await waitFor( () => result.current.isError );

		expect( result.current.isError ).toBe( true );
		expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
			'partner-portal-billing-dashboard-failure'
		);
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-error' );
	} );
} );
