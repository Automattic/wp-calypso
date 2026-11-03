/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../test-utils';
import {
	MigrationCompletedNotice,
	useShouldShowMigrationCompletedNotice,
} from '../migration-completed-notice';
import type { Site } from '@automattic/api-core';

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

beforeEach( () => config.enable( 'migration/reprint-flow' ) );
afterEach( () => {
	config.disable( 'migration/reprint-flow' );
	queryClient.clear();
} );

test( 'confirms a migration that just finished, with a link to connect its domain', async () => {
	mockPreferences();
	render( <Harness site={ completedSite( { hoursAgo: 1 } ) } /> );

	await waitFor( () => expect( screen.getByText( 'Your site is ready' ) ).toBeInTheDocument() );
	const link = screen.getByRole( 'link', { name: 'Connect example.com' } );
	expect( link.getAttribute( 'href' ) ).toContain( 'initialQuery=example.com' );
	expect( link.getAttribute( 'href' ) ).toContain( 'step=transfer-or-connect' );
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
