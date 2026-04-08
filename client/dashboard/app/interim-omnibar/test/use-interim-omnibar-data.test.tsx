/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderToStaticMarkup } from 'react-dom/server';
import { omnibarEvents } from '../click-handlers';
import { useInterimOmnibarData, type InterimOmnibarData } from '../interim-omnibar-container';
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

	test( 'pre-hydration render matches SSR shape with no callbacks', () => {
		// Render synchronously via `renderToStaticMarkup` so `useEffect` never
		// fires; this is the only way to observe the hook's first-render output,
		// which must match what the server rendered for hydration to succeed.
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		let captured: InterimOmnibarData | undefined;
		function Probe() {
			captured = useInterimOmnibarData( { initialUser: testUser, events: omnibarEvents } );
			return null;
		}
		renderToStaticMarkup(
			<QueryClientProvider client={ queryClient }>
				<Probe />
			</QueryClientProvider>
		);

		expect( captured ).toBeDefined();
		expect( captured!.user ).toBe( testUser );
		expect( captured!.site ).toBeNull();
		expect( captured!.onToggleMenu ).toBeUndefined();
		expect( captured!.onToggleNotifications ).toBeUndefined();
	} );

	test( 'post-hydration callbacks emit on the events bus', async () => {
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
} );
