/**
 * @jest-environment jsdom
 */
import { readProfileSettingsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock, { type DataMatcherMap } from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import * as notices from 'calypso/state/notices/actions';
import { ProfileOptionsMenu } from '../index';
import type { ReadProfileSettingsResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const settings = {
	'achievements-visibility': 'private' as const,
	'reader-profile-posts-visibility': 'public' as const,
	'reader-profile-sites-visibility': 'public' as const,
};

const makeQueryClient = () =>
	new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

const makeStore = () =>
	createStore(
		combineReducers( { reader: ( state = {} ) => state } ),
		applyMiddleware( thunkMiddleware )
	);

const renderWithProviders = ( queryClient: QueryClient, children: ReactNode ) =>
	render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ makeStore() }>{ children }</Provider>
		</QueryClientProvider>
	);

const seedSettings = (
	queryClient: QueryClient,
	login: string,
	value: ReadProfileSettingsResponse
) => {
	queryClient.setQueryData( readProfileSettingsQuery( login ).queryKey, value );
};

const readCache = ( queryClient: QueryClient, login: string ) =>
	queryClient.getQueryData< ReadProfileSettingsResponse >(
		readProfileSettingsQuery( login ).queryKey
	);

const mockUpdatePreferences = ( body?: DataMatcherMap, status = 200 ) => {
	const scope = nock( 'https://public-api.wordpress.com' );
	const payload = status === 200 ? { calypso_preferences: body ?? {} } : { error: 'oops' };
	return body
		? scope
				.post( '/rest/v1.1/me/preferences', { calypso_preferences: body } )
				.reply( status, payload )
		: scope.post( '/rest/v1.1/me/preferences' ).reply( status, payload );
};

describe( 'ProfileOptionsMenu', () => {
	beforeEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'renders Hide labels when both tabs are currently visible', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			makeQueryClient(),
			<ProfileOptionsMenu userLogin="lessbloat" showPosts showSites />
		);

		await user.click( screen.getByRole( 'button', { name: 'Profile options' } ) );

		const postsItem = await screen.findByRole( 'menuitem', { name: 'Hide my posts' } );
		const sitesItem = await screen.findByRole( 'menuitem', { name: 'Hide my sites' } );
		// Popover content lands in a portal; jsdom can't always resolve framer-motion
		// `visibility` transitions to satisfy `.toBeVisible()`, so we assert presence
		// + accessible name (which `findByRole({ name })` already enforces).
		expect( postsItem ).toBeInTheDocument();
		expect( sitesItem ).toBeInTheDocument();
	} );

	test( 'flips to Show labels when tabs are currently hidden', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			makeQueryClient(),
			<ProfileOptionsMenu userLogin="lessbloat" showPosts={ false } showSites={ false } />
		);

		await user.click( screen.getByRole( 'button', { name: 'Profile options' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Show my posts' } ) ).toBeInTheDocument();
		expect( await screen.findByRole( 'menuitem', { name: 'Show my sites' } ) ).toBeInTheDocument();
	} );

	test( 'on Hide my posts, optimistically patches the cache and POSTs the new value', async () => {
		const user = userEvent.setup();
		const queryClient = makeQueryClient();
		seedSettings( queryClient, 'lessbloat', { settings } );
		const scope = mockUpdatePreferences( { 'reader-profile-posts-visibility': 'hidden' } );

		renderWithProviders(
			queryClient,
			<ProfileOptionsMenu userLogin="lessbloat" showPosts showSites />
		);

		await user.click( screen.getByRole( 'button', { name: 'Profile options' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Hide my posts' } ) );

		// Optimistic patch is synchronous; the cache should already reflect 'hidden'.
		expect(
			readCache( queryClient, 'lessbloat' )?.settings[ 'reader-profile-posts-visibility' ]
		).toBe( 'hidden' );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'on POST failure, rolls back the cache and dispatches a Posts-specific error notice', async () => {
		const user = userEvent.setup();
		const queryClient = makeQueryClient();
		seedSettings( queryClient, 'lessbloat', { settings } );
		mockUpdatePreferences( undefined, 500 );
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );

		renderWithProviders(
			queryClient,
			<ProfileOptionsMenu userLogin="lessbloat" showPosts showSites />
		);

		await user.click( screen.getByRole( 'button', { name: 'Profile options' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Hide my posts' } ) );

		await waitFor( () => expect( errorNoticeSpy ).toHaveBeenCalled() );
		expect( errorNoticeSpy.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.stringContaining( 'Posts visibility' )
		);
		expect(
			readCache( queryClient, 'lessbloat' )?.settings[ 'reader-profile-posts-visibility' ]
		).toBe( 'public' );
	} );

	test( 'failure on the Sites toggle dispatches the Sites-specific error notice', async () => {
		const user = userEvent.setup();
		const queryClient = makeQueryClient();
		seedSettings( queryClient, 'lessbloat', { settings } );
		mockUpdatePreferences( undefined, 500 );
		const errorNoticeSpy = jest.spyOn( notices, 'errorNotice' );

		renderWithProviders(
			queryClient,
			<ProfileOptionsMenu userLogin="lessbloat" showPosts showSites />
		);

		await user.click( screen.getByRole( 'button', { name: 'Profile options' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Hide my sites' } ) );

		await waitFor( () => expect( errorNoticeSpy ).toHaveBeenCalled() );
		expect( errorNoticeSpy.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.stringContaining( 'Sites visibility' )
		);
	} );
} );
