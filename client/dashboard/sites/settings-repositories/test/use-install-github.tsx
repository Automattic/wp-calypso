/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import nock from 'nock';
import { AnalyticsProvider } from '../../../app/analytics';
import { useInstallGithub } from '../use-install-github';

const EVENT = 'calypso_hosting_github_app_open_auth_popup_requested';

function setup() {
	const recordTracksEvent = jest.fn();
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	const { result, rerender } = renderHook( () => useInstallGithub(), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>
				<AnalyticsProvider client={ { recordTracksEvent, recordPageView: jest.fn() } }>
					{ children }
				</AnalyticsProvider>
			</QueryClientProvider>
		),
	} );

	const popupEventCount = () =>
		recordTracksEvent.mock.calls.filter( ( [ name ] ) => name === EVENT ).length;

	return { result, rerender, popupEventCount };
}

describe( 'useInstallGithub', () => {
	beforeEach( () => {
		jest.spyOn( window, 'open' ).mockReturnValue( null );

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/hosting/github/installations' )
			.query( true )
			.reply( 200, [] );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'does not record the popup event on render', async () => {
		const { rerender, popupEventCount } = setup();

		rerender();
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		rerender();

		expect( popupEventCount() ).toBe( 0 );
	} );

	it( 'records the popup event once per installGithub call', () => {
		const { result, popupEventCount } = setup();

		act( () => result.current.installGithub( { onSuccess: jest.fn() } ) );

		expect( popupEventCount() ).toBe( 1 );
	} );
} );
