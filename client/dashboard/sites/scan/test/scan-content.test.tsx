/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { ScanContent } from '../scan-content';
import type { Site, SiteScan } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
} as Site;

const idleScan = {
	state: 'idle',
	threats: [],
	most_recent: {
		timestamp: '2026-09-28T00:00:00+00:00',
		error: false,
	},
} as unknown as SiteScan;

function mockPreferences() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
}

function mockScan( scan: SiteScan ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/scan` )
		.query( true )
		.reply( 200, scan )
		.persist();
}

function mockScanEnqueue() {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ site.ID }/scan/enqueue` )
		.query( true )
		.reply( 200, { success: true } );
}

describe( '<ScanContent>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'keeps showing a requested scan after navigating away and back before it starts', async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		mockPreferences();
		mockScan( idleScan );
		mockScanEnqueue();

		const { unmount } = render( <ScanContent site={ site } scanTab="active" />, { queryClient } );

		await user.click( await screen.findByRole( 'button', { name: 'Scan now' } ) );
		expect( await screen.findByText( 'Preparing to Scan…' ) ).toBeVisible();

		unmount();
		render( <ScanContent site={ site } scanTab="active" />, { queryClient } );

		expect( await screen.findByText( 'Preparing to Scan…' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Scan now' } ) ).toBeDisabled();
	} );
} );
