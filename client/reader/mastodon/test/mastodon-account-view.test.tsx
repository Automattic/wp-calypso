/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TIMELINE_TAB } from '../helper';
import { MastodonAccountView } from '../mastodon-account-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const listUrl = '/wpcom/v2/reader/mastodon/connections';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function mockConnections() {
	nock( 'https://public-api.wordpress.com' )
		.get( listUrl )
		.reply( 200, {
			connections: [
				{
					id: 7,
					instance: 'mastodon.social',
					handle: 'alice@mastodon.social',
					display_name: null,
					avatar: null,
					needs_reauth: false,
				},
			],
		} );
}

describe( 'MastodonAccountView header', () => {
	beforeAll( () => {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof global.IntersectionObserver;
	} );

	afterAll( () => {
		// @ts-expect-error -- cleaning up the stub
		delete global.IntersectionObserver;
	} );

	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'renders the section title and the handle-aware subtitle in the header', async () => {
		mockConnections();
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'heading', { name: /Mastodon/ } ) ).toBeVisible();
		expect( screen.getByTestId( 'mastodon-section-logo' ) ).toBeVisible();
		expect(
			screen.getByText(
				/Catch up with the latest from the people you follow on Mastodon with @alice@mastodon\.social/
			)
		).toBeVisible();
	} );

	it( 'redirects when connection id is not in the list', async () => {
		mockConnections();
		renderWithProvider( <MastodonAccountView connectionId={ 999 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon' ) );
	} );
} );
