/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useDispatch } from 'react-redux';
import usePayInvoiceMutation from 'calypso/state/partner-portal/invoices/hooks/pay-invoice-mutation';
import useInvoicesQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';

jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn( () => null ),
	useSelector: () => 1,
} ) );

function createQueryClient() {
	return new QueryClient();
}

describe( 'useInvoicesQuery', () => {
	it( 'returns transformed request data', async () => {
		const queryClient = createQueryClient();
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

		const { result } = renderHook(
			() =>
				useInvoicesQuery( {
					starting_after: '',
					ending_before: '',
				} ),
			{
				wrapper,
			}
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( formattedStub );
	} );
} );

describe( 'usePayInvoiceMutation', () => {
	const invoiceStub = {
		id: 'in_1234',
		number: 'ABC-123',
		due_date: '2022-04-04 12:00:00',
		status: 'open',
		total: 12.34,
		invoice_pdf: 'https://example.org/invoice.pdf',
	};

	it( 'dispatches notice on success', async () => {
		const queryClient = createQueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/jetpack-licensing/partner/invoice/${ invoiceStub.id }/payment` )
			.reply( 200, invoiceStub );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		const { result } = renderHook( () => usePayInvoiceMutation(), {
			wrapper,
		} );

		await act( async () => result.current.mutateAsync( { invoiceId: invoiceStub.id } ) );

		await waitFor( () => {
			expect( result.current.data ).toEqual( invoiceStub );
			expect( result.current.isSuccess ).toBe( true );
			expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
			expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
				'partner-portal-pay-invoice-success'
			);
			expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-success' );
		} );
	} );

	it( 'dispatches notice on error', async () => {
		const queryClient = createQueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const stub = {
			code: 'unable_to_pay_invoice',
			message: 'Unable to pay invoice. Please try again later.',
		};

		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/jetpack-licensing/partner/invoice/${ invoiceStub.id }/payment` )
			.reply( 500, stub );

		const dispatch = jest.fn();
		useDispatch.mockReturnValue( dispatch );

		// Prevent console.error from being loud during testing because of the test 500 error.
		const { result } = renderHook( () => usePayInvoiceMutation( { useErrorBoundary: false } ), {
			wrapper,
		} );

		try {
			await act( async () => result.current.mutateAsync( { invoiceId: invoiceStub.id } ) );
		} catch ( e ) {
			// mutateAsync will throw errors and we do not have any mutation options to prevent it,
			// so we have to wrap it in a try/catch.
		}

		await waitFor( () => {
			expect( dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( 'NOTICE_CREATE' );
			expect( dispatch.mock.calls[ 0 ][ 0 ].notice.text ).toBe( stub.message );
			expect( dispatch.mock.calls[ 0 ][ 0 ].notice.noticeId ).toBe(
				'partner-portal-pay-invoice-failure'
			);
			expect( dispatch.mock.calls[ 0 ][ 0 ].notice.status ).toBe( 'is-error' );
		} );
	} );
} );
