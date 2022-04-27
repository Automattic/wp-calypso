/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { setLogger, QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch } from 'react-redux';
import useInvoicesQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';

jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn( () => null ),
	useSelector: () => 1,
} ) );

describe( 'useInvoicesQuery', () => {
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
			items: [
				{
					id: 'in_1234',
					due_date: '2022-04-04 12:00:00',
					status: 'open',
					total: 12.34,
					invoice_pdf: 'https://example.org/invoice.pdf',
				},
			],
		};

		const formattedStub = {
			items: [
				{
					id: 'in_1234',
					dueDate: '2022-04-04 12:00:00',
					status: 'open',
					total: 12.34,
					pdfUrl: 'https://example.org/invoice.pdf',
				},
			],
		};

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/partner/invoices?starting_after=&ending_before=' )
			.reply( 200, stub );

		const { result, waitFor } = renderHook(
			() =>
				useInvoicesQuery( {
					starting_after: '',
					ending_before: '',
				} ),
			{
				wrapper,
			}
		);

		await waitFor( () => result.current.isSuccess );

		expect( result.current.data ).toEqual( formattedStub );
	} );

	it( 'dispatches notice on error', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/jetpack-licensing/partner/invoices?starting_after=&ending_before=' )
			.reply( 403 );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		const { result, waitFor } = renderHook(
			() =>
				useInvoicesQuery(
					{
						starting_after: '',
						ending_before: '',
					},
					{ retry: false }
				),
			{
				wrapper,
			}
		);

		await waitFor( () => result.current.isError );

		expect( result.current.isError ).toBe( true );
		expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
			'partner-portal-invoices-failure'
		);
		expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-error' );
	} );
} );

describe( 'usePayInvoiceMutation', () => {
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

	it( '@todo implement', async () => {
		// @todo implement
	} );
} );
