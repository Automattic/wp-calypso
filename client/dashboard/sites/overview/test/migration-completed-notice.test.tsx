/**
 * @vitest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { createRouter } from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { vi } from 'vitest';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { createDomainsRoutes } from '../../../app/router/domains';
import { rootRoute } from '../../../app/router/root';
import { render } from '../../../test-utils';
import {
	MigrationCompletedNotice,
	useShouldShowMigrationCompletedNotice,
} from '../migration-completed-notice';
import type { Site } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';

let mockIsBackport = false;
vi.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: () => mockIsBackport,
} ) );

// The domain routes only get their `fullPath` once a router builds the real route tree.
beforeAll( () => {
	createRouter( {
		routeTree: rootRoute.addChildren( createDomainsRoutes() ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
} );

const siteId = 123;
const HOUR_IN_SECONDS = 60 * 60;
const now = Math.floor( Date.now() / 1000 );

function mockPreferences() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.post( '/rest/v1.1/me/preferences' )
		.reply( 200, ( _uri, body ) => body );
}

let mockDomainsResponse: [ number, unknown ] = [ 200, { domains: [] } ];

function mockDomains( domains: { domain: string; blog_id: number }[] ) {
	mockDomainsResponse = [ 200, { domains } ];
}

async function waitForDomains( client: QueryClient, status: 'success' | 'error' = 'success' ) {
	await waitFor( () =>
		expect( client.getQueryState( [ 'domains', 'all' ] )?.status ).toBe( status )
	);
}

function getConnectLink() {
	return screen.getByRole( 'link', { name: 'Connect example.com' } ).getAttribute( 'href' );
}

function completedSite( {
	hoursAgo,
	url = 'https://example.wpcomstaging.com',
	id = siteId,
}: {
	hoursAgo: number;
	url?: string;
	id?: number;
} ) {
	return {
		ID: id,
		slug: 'example.wpcomstaging.com',
		URL: url,
		site_migration: {
			type: 'wordpress',
			status_v2: 'completed',
			source_domain: 'example.com',
			completed_at: now - hoursAgo * HOUR_IN_SECONDS,
			in_progress: false,
			is_complete: true,
		},
	} as Site;
}

function Harness( { site }: { site: Site } ) {
	const shouldShow = useShouldShowMigrationCompletedNotice( site );
	return shouldShow ? <MigrationCompletedNotice key={ site.ID } site={ site } /> : <p>No notice</p>;
}

beforeEach( () => {
	config.enable( 'migration/reprint-flow' );
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( () => mockDomainsResponse );
} );
afterEach( () => {
	nock.cleanAll();
	mockDomainsResponse = [ 200, { domains: [] } ];
	mockIsBackport = false;
	config.disable( 'migration/reprint-flow' );
	queryClient.clear();
	window._sva = undefined;
	window.localStorage.clear();
} );

test( 'confirms a migration that just finished, with a link to connect its domain', async () => {
	mockPreferences();
	const { queryClient: client } = render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument() );
	await waitForDomains( client );
	expect( getConnectLink() ).toContain( '/setup/domain/use-my-domain' );
	expect( getConnectLink() ).toContain( 'initialQuery=example.com' );
	expect( getConnectLink() ).toContain( 'step=transfer-or-connect' );
} );

test( 'links to the connection setup once the domain is on the site', async () => {
	mockPreferences();
	mockDomains( [ { domain: 'example.com', blog_id: siteId } ] );
	render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitFor( () =>
		expect( getConnectLink() ).toMatch( /\/domains\/example\.com\/domain-connection-setup$/ )
	);
} );

test( 'links to the classic connection setup in the Calypso backport', async () => {
	mockIsBackport = true;
	mockPreferences();
	mockDomains( [ { domain: 'example.com', blog_id: siteId } ] );
	render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitFor( () =>
		expect( getConnectLink() ).toBe( '/domains/mapping/example.wpcomstaging.com/setup/example.com' )
	);
} );

test( 'keeps the use-my-domain link when the domain is on another site', async () => {
	mockPreferences();
	mockDomains( [ { domain: 'example.com', blog_id: 456 } ] );
	const { queryClient: client } = render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitForDomains( client );
	expect( getConnectLink() ).toContain( '/setup/domain/use-my-domain' );
} );

test( 'keeps the use-my-domain link when the domains fail to load', async () => {
	mockPreferences();
	mockDomainsResponse = [ 500, { error: 'unknown' } ];
	const { queryClient: client } = render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitForDomains( client, 'error' );
	expect( getConnectLink() ).toContain( '/setup/domain/use-my-domain' );
} );

test( 'confirms a migration that just finished even when its domain is already primary', async () => {
	mockPreferences();
	render( <Harness site={ completedSite( { hoursAgo: 1, url: 'https://example.com' } ) } /> );

	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument() );
	expect( screen.queryByRole( 'link', { name: /Connect/ } ) ).not.toBeInTheDocument();
} );

test( 'after the first day, shows only while the source domain is not primary, for 30 days', async () => {
	mockPreferences();
	const { unmount } = render( <Harness site={ completedSite( { hoursAgo: 48 } ) } /> );
	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument() );
	unmount();

	mockPreferences();
	const { unmount: unmountPrimary } = render(
		<Harness site={ completedSite( { hoursAgo: 48, url: 'https://example.com' } ) } />
	);
	await waitFor( () => expect( screen.getByText( 'No notice' ) ).toBeInTheDocument() );
	unmountPrimary();

	mockPreferences();
	render( <Harness site={ completedSite( { hoursAgo: 31 * 24 } ) } /> );
	await waitFor( () => expect( screen.getByText( 'No notice' ) ).toBeInTheDocument() );
} );

// The Overview stays mounted when switching sites.
function SiteSwitcher() {
	const [ id, setId ] = useState( siteId );
	return (
		<>
			<button onClick={ () => setId( id === siteId ? 456 : siteId ) }>Switch site</button>
			<Harness site={ completedSite( { hoursAgo: 1, id } ) } />
		</>
	);
}

test( 'a dismissal is saved for that site only', async () => {
	const user = userEvent.setup();
	const scope = mockPreferences();
	// The app-wide client, which the preference mutation writes the dismissal to.
	render( <SiteSwitcher />, { queryClient } );

	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument() );
	await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
	expect( screen.queryByText( 'Your site is ready' ) ).not.toBeInTheDocument();
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );

	await user.click( screen.getByRole( 'button', { name: 'Switch site' } ) );
	expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument();

	await user.click( screen.getByRole( 'button', { name: 'Switch site' } ) );
	expect( screen.getByText( 'No notice' ) ).toBeInTheDocument();
} );

test( 'asks for the migration survey once per migration, even on a later visit', async () => {
	const invokeEvent = vi.fn();
	Object.assign( window, { _sva: { invokeEvent } } );

	mockPreferences();
	const { unmount } = render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );
	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeVisible() );
	expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	expect( invokeEvent ).toHaveBeenCalledWith( 'migrationCompleted' );
	unmount();

	mockPreferences();
	const { unmount: unmountAgain } = render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );
	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeVisible() );
	expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	unmountAgain();

	// A later migration into the same site asks again.
	mockPreferences();
	render( <Harness site={ completedSite( { hoursAgo: 0.5 } ) } /> );
	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeVisible() );
	expect( invokeEvent ).toHaveBeenCalledTimes( 2 );
} );
