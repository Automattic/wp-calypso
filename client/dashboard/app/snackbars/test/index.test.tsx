/**
 * @jest-environment jsdom
 */

import { MutationObserver, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { SnackbarList } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import Snackbars from '../index';
import type { MutationMeta } from '@tanstack/react-query';

const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockRemoveNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( '@wordpress/components', () => ( {
	SnackbarList: jest.fn( () => null ),
} ) );

jest.mock( '@wordpress/notices', () => ( {
	store: {},
} ) );

const mockedUseSelect = useSelect as jest.Mock;
const mockedUseDispatch = useDispatch as jest.Mock;

function renderSnackbars() {
	const queryClient = new QueryClient();
	render(
		<QueryClientProvider client={ queryClient }>
			<Snackbars />
		</QueryClientProvider>
	);
	return queryClient;
}

function runMutation( queryClient: QueryClient, meta: MutationMeta, error?: Error ) {
	const observer = new MutationObserver( queryClient, {
		mutationFn: () => ( error ? Promise.reject( error ) : Promise.resolve() ),
		meta,
	} );
	return act( () => observer.mutate().catch( () => {} ) );
}

describe( 'Snackbars', () => {
	let currentNotices: Array< {
		id: string;
		type: string;
		status?: string;
		content?: string;
	} >;

	beforeEach( () => {
		currentNotices = [
			{
				id: 'existing-snackbar',
				type: 'snackbar',
				status: 'success',
				content: 'Existing notice',
			},
		];

		mockedUseSelect.mockImplementation( () => currentNotices );

		mockedUseDispatch.mockImplementation( () => ( {
			removeNotice: mockRemoveNotice,
			createSuccessNotice: mockCreateSuccessNotice,
			createErrorNotice: mockCreateErrorNotice,
		} ) );
	} );

	test( 'creates success snackbar when mutation meta includes a success message', async () => {
		const queryClient = renderSnackbars();

		await runMutation( queryClient, {
			// Testing the underlying snackbar behaviour, so don't use withSnackbar() here.
			// eslint-disable-next-line no-restricted-syntax
			snackbar: { success: 'Operation completed.' },
		} );

		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith( 'Operation completed.', {
			type: 'snackbar',
		} );
		expect( mockCreateErrorNotice ).not.toHaveBeenCalled();
	} );

	test( 'passes snackbar status as a class name for styling', () => {
		currentNotices = [
			{
				id: 'success-snackbar',
				type: 'snackbar',
				status: 'success',
				content: 'Existing notice',
			},
			{
				id: 'error-snackbar',
				type: 'snackbar',
				status: 'error',
				content: 'Failed notice',
			},
		];

		renderSnackbars();

		const [ props ] = ( SnackbarList as jest.Mock ).mock.calls[ 0 ];

		expect( props.notices ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					id: 'success-snackbar',
					className: 'is-success',
				} ),
				expect.objectContaining( {
					id: 'error-snackbar',
					className: 'is-error',
				} ),
			] )
		);
	} );

	test( 'surfaces server error messages when requested by mutation meta', async () => {
		const queryClient = renderSnackbars();

		await runMutation(
			queryClient,
			{
				// eslint-disable-next-line no-restricted-syntax -- see above: we're testing the snackbar behaviour itself.
				snackbar: { error: { source: 'server' } },
			},
			new Error( 'Server rejected the request.' )
		);

		expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Server rejected the request.', {
			type: 'snackbar',
		} );
		expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
	} );

	test( 'uses snackbar error string when provided directly by mutation meta', async () => {
		const queryClient = renderSnackbars();

		await runMutation(
			queryClient,
			{
				// eslint-disable-next-line no-restricted-syntax -- see above: we're testing the snackbar behaviour itself.
				snackbar: { error: 'Custom snackbar error.' },
			},
			new Error( 'Server rejected the request.' )
		);

		expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Custom snackbar error.', {
			type: 'snackbar',
		} );
	} );
} );
