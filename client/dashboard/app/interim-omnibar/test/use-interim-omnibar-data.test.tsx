/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { omnibarEvents } from '../click-handlers';
import { useInterimOmnibarData } from '../interim-omnibar-container';
import type { Site, User } from '@automattic/api-core';

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
}

const testUser = {
	ID: 1,
	display_name: 'Test User',
	username: 'testuser',
	primary_blog: 42,
	site_count: 1,
} as unknown as User;

const testSite = {
	ID: 42,
	name: 'Test Site',
	slug: 'testsite.wordpress.com',
	URL: 'https://testsite.wordpress.com',
} as unknown as Site;

function mockPreferences( preferences: Record< string, unknown > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockSiteById( siteId: number, site: Partial< Site > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteId }` )
		.query( true )
		.reply( 200, site );
}

describe( 'useInterimOmnibarData', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'returns the bootstrapped user via initialData without hitting the network', async () => {
		mockPreferences( {} );

		const { result } = renderHook(
			() => useInterimOmnibarData( { initialUser: testUser, events: omnibarEvents } ),
			{ wrapper: createWrapper() }
		);

		await waitFor( () => {
			expect( result.current.user ).toBe( testUser );
		} );
		expect( result.current.site ).toBeNull();
	} );

	test( 'wires up toggle callbacks after hydration and they emit on the events bus', async () => {
		mockPreferences( {} );

		const menuSpy = jest.fn();
		const notificationsSpy = jest.fn();
		const unsubMenu = omnibarEvents.mobileMenu.subscribe( menuSpy );
		const unsubNotifications = omnibarEvents.notifications.subscribe( notificationsSpy );

		const { result } = renderHook(
			() => useInterimOmnibarData( { initialUser: testUser, events: omnibarEvents } ),
			{ wrapper: createWrapper() }
		);

		await waitFor( () => {
			expect( result.current.onToggleMenu ).toBeDefined();
			expect( result.current.onToggleNotifications ).toBeDefined();
		} );

		result.current.onToggleMenu!();
		result.current.onToggleNotifications!();

		expect( menuSpy ).toHaveBeenCalledTimes( 1 );
		expect( notificationsSpy ).toHaveBeenCalledTimes( 1 );

		unsubMenu();
		unsubNotifications();
	} );

	test( 'loads the first recent site from preferences and fetches its details', async () => {
		mockPreferences( { recentSites: [ 42 ] } );
		mockSiteById( 42, testSite );

		const { result } = renderHook(
			() => useInterimOmnibarData( { initialUser: testUser, events: omnibarEvents } ),
			{ wrapper: createWrapper() }
		);

		await waitFor( () => {
			expect( result.current.site ).toMatchObject( { ID: 42, slug: 'testsite.wordpress.com' } );
		} );
	} );

	test( 'falls back to the user primary_blog when no recent site is stored', async () => {
		mockPreferences( {} );
		mockSiteById( 42, testSite );

		const { result } = renderHook(
			() => useInterimOmnibarData( { initialUser: testUser, events: omnibarEvents } ),
			{ wrapper: createWrapper() }
		);

		await waitFor( () => {
			expect( result.current.site ).toMatchObject( { ID: 42 } );
		} );
	} );

	test( 'keeps site null until a siteId is known', async () => {
		mockPreferences( {} );

		const userWithoutPrimaryBlog = { ...testUser, primary_blog: undefined } as unknown as User;

		const { result } = renderHook(
			() =>
				useInterimOmnibarData( {
					initialUser: userWithoutPrimaryBlog,
					events: omnibarEvents,
				} ),
			{ wrapper: createWrapper() }
		);

		await waitFor( () => {
			expect( result.current.user ).toBe( userWithoutPrimaryBlog );
		} );
		expect( result.current.site ).toBeNull();
	} );
} );
