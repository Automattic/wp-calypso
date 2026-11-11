/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

import page from '@automattic/calypso-router';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { ROUTE_SET } from 'calypso/state/action-types';
import routeReducer from 'calypso/state/route/reducer';
import { ShelvesRetiredModal } from '..';

function navigate( store: ReturnType< typeof createStore >, query: Record< string, string > ) {
	window.history.replaceState( null, '', `/reader?${ new URLSearchParams( query ) }` );
	act( () => {
		store.dispatch( { type: ROUTE_SET, path: '/reader', query } );
	} );
}

function renderOnReader( query: Record< string, string > = {} ) {
	const store = createStore( combineReducers( { route: routeReducer } ) );
	navigate( store, query );
	render(
		<Provider store={ store }>
			<ShelvesRetiredModal />
		</Provider>
	);
	return store;
}

describe( 'ShelvesRetiredModal', () => {
	beforeEach( () => {
		jest.mocked( page.replace ).mockReset();
	} );

	it( 'renders nothing on a regular Reader visit', () => {
		renderOnReader();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'explains that Shelves has been retired after a redirect from an old shelf link', () => {
		renderOnReader( { retired: 'shelves' } );
		expect( screen.getByRole( 'dialog', { name: 'Shelves has been retired' } ) ).toBeVisible();
	} );

	it( 'closes and drops the query arg without re-dispatching the route', async () => {
		const user = userEvent.setup();
		renderOnReader( { retired: 'shelves', at: '2026-11-01' } );

		await user.click( screen.getByRole( 'button', { name: 'Got it' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( page.replace ).toHaveBeenCalledWith( '/reader?at=2026-11-01', null, false, false );
	} );

	it( 'opens when an in-app redirect lands on the page it is already mounted on', async () => {
		const user = userEvent.setup();
		const store = renderOnReader();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		navigate( store, { retired: 'shelves' } );
		expect( screen.getByRole( 'dialog', { name: 'Shelves has been retired' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Got it' } ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		navigate( store, { retired: 'shelves' } );
		expect( screen.getByRole( 'dialog', { name: 'Shelves has been retired' } ) ).toBeVisible();
	} );
} );
