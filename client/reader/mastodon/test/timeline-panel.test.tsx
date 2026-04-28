/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TimelinePanel } from '../timeline-panel';
import type { MastodonConnection } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

const CONNECTION: MastodonConnection = {
	id: 9,
	handle: '@alice@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Alice',
	avatar: null,
};

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'Mastodon TimelinePanel', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders without crashing on an empty timeline', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/9/timeline' )
			.reply( 200, { items: [], cursor: null } );
		const { findByText } = renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		expect( await findByText( /caught up/i ) ).toBeVisible();
	} );
} );
