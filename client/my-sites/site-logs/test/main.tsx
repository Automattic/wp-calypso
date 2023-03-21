/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useNock, nock } from 'calypso/test-helpers/use-nock';
import { SiteLogs } from '../main';

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

describe( 'SiteLogs', () => {
	useNock();

	test( 'displays the last 7 days worth of logs in descending order on mount', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/113/hosting/logs', ( { start, end, sort_order } ) => {
				const sevenDays = 7 * 24 * 60 * 60;
				const fudgeFactor = 5; // Allow for a few seconds of drift
				const timeRange = end - start;
				return sort_order === 'desc' && Math.abs( timeRange - sevenDays ) < fudgeFactor;
			} )
			.reply( 200, {
				message: 'OK',
				data: {
					scroll_id: null,
					total_results: 1,
					logs: [ { message: 'log entry' } ],
				},
			} );

		render( <SiteLogs />, { initialState: { ui: { selectedSiteId: 113 } } } );

		await waitFor( () =>
			expect( screen.getByText( /"message" = log entry/ ) ).toBeInTheDocument()
		);
	} );
} );
