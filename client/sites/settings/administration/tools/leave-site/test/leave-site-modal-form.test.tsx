/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { leaveSite } from 'calypso/state/sites/actions';
import LeaveSiteModalForm from '../leave-site-modal-form';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	leaveSite: jest.fn(),
} ) );

const SITE_ID = 123;
const SITE_USER_ID = 456;
const REASSIGNMENT_COPY =
	'Any content you authored will stay on the site and be reassigned to the site owner.';

function deferredResult() {
	let resolve!: ( result: boolean ) => void;
	const promise = new Promise< boolean >( ( done ) => {
		resolve = done;
	} );
	return { promise, resolve };
}

function renderForm( isAtomic = false ) {
	const initialState = {
		currentUser: { id: 5 },
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					URL: 'https://example.wordpress.com',
					name: 'Example',
					site_owner: 1,
					options: { is_automated_transfer: isAtomic },
				},
			},
		},
		purchases: { data: [], hasLoadedSitePurchasesFromServer: true },
	};
	const store = createStore( ( state = initialState ) => state, applyMiddleware( thunk ) );
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false } },
	} );
	queryClient.setQueryData( [ 'core-users-me', SITE_ID ], { id: SITE_USER_ID } );
	const onSuccess = jest.fn();
	const onClose = jest.fn();

	render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<LeaveSiteModalForm siteId={ SITE_ID } onSuccess={ onSuccess } onClose={ onClose } />
			</QueryClientProvider>
		</Provider>
	);

	return { onSuccess, onClose };
}

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( '<LeaveSiteModalForm>', () => {
	test( 'explains reassignment for Atomic', () => {
		renderForm( true );

		expect( screen.getByText( REASSIGNMENT_COPY ) ).toBeVisible();
	} );

	test( 'omits the reassignment warning for Simple', () => {
		renderForm();

		expect( screen.queryByText( REASSIGNMENT_COPY ) ).not.toBeInTheDocument();
	} );

	test( 'disables the pending controls and dispatches one thunk on a double click', async () => {
		const user = userEvent.setup();
		const pending = deferredResult();
		const leaveThunk = jest.fn( () => pending.promise );
		jest.mocked( leaveSite ).mockReturnValue( leaveThunk );
		const { onSuccess, onClose } = renderForm( true );
		const checkbox = screen.getByRole( 'checkbox' );
		const cancel = screen.getByRole( 'button', { name: 'Cancel' } );
		const leave = screen.getByRole( 'button', { name: 'Leave site' } );

		expect( checkbox ).toBeVisible();
		expect( leave ).toBeDisabled();
		await user.click( checkbox );
		await user.dblClick( leave );

		expect( leaveSite ).toHaveBeenCalledTimes( 1 );
		expect( leaveSite ).toHaveBeenCalledWith( SITE_ID, SITE_USER_ID );
		expect( leaveThunk ).toHaveBeenCalledTimes( 1 );
		expect( checkbox ).toBeDisabled();
		expect( cancel ).toBeDisabled();
		expect( leave ).toBeDisabled();
		await user.click( cancel );
		await user.click( checkbox );
		await user.dblClick( leave );
		expect( leaveThunk ).toHaveBeenCalledTimes( 1 );
		expect( checkbox ).toBeChecked();
		expect( page.redirect ).not.toHaveBeenCalled();
		expect( onSuccess ).not.toHaveBeenCalled();
		expect( onClose ).not.toHaveBeenCalled();

		await act( async () => pending.resolve( false ) );
		await waitFor( () => expect( leave ).toBeEnabled() );
		expect( checkbox ).toBeEnabled();
		expect( cancel ).toBeEnabled();
	} );

	test.each( [
		{ result: true, redirects: [ [ '/sites' ] ], callbackCount: 1 },
		{ result: false, redirects: [], callbackCount: 0 },
	] )(
		'only navigates and closes for a confirmed removal (result: $result)',
		async ( { result, redirects, callbackCount } ) => {
			const user = userEvent.setup();
			const pending = deferredResult();
			const leaveThunk = jest.fn( () => pending.promise );
			jest.mocked( leaveSite ).mockReturnValue( leaveThunk );
			const { onSuccess, onClose } = renderForm();
			const leave = screen.getByRole( 'button', { name: 'Leave site' } );

			await user.click( screen.getByRole( 'checkbox' ) );
			await user.click( leave );
			expect( leaveThunk ).toHaveBeenCalledTimes( 1 );
			expect( page.redirect ).not.toHaveBeenCalled();
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onClose ).not.toHaveBeenCalled();

			await act( async () => pending.resolve( result ) );
			await waitFor( () => expect( leave ).toBeEnabled() );
			expect( jest.mocked( page.redirect ).mock.calls ).toEqual( redirects );
			expect( onSuccess ).toHaveBeenCalledTimes( callbackCount );
			expect( onClose ).toHaveBeenCalledTimes( callbackCount );
		}
	);
} );
