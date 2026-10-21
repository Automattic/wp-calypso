/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialNotificationsPanel } from '../social-notifications-panel';
import type {
	SocialNotificationsSource,
	UseSocialNotificationsInfiniteQuery,
} from '../social-notifications-panel';

// `recordReaderTracksEvent` is mocked so the test asserts on its call site
// without dispatching against the follows query cache. The shared panel owns
// the per-`source` event-name interpolation; the test exists to pin that
// contract — a future rename would surface here rather than only on the
// per-protocol smoke tests.
const mockRecordReaderTracksEvent = jest.fn<
	{ type: string },
	[ string, Record< string, unknown >? ]
>( () => ( { type: '@@TEST/NOOP' } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( event: string, props?: Record< string, unknown > ) =>
		mockRecordReaderTracksEvent( event, props ),
} ) );

function makeStubHook(): UseSocialNotificationsInfiniteQuery< never > {
	// A minimal stand-in for `useXxxNotificationsInfiniteQuery`. The shared
	// panel only reads the listed fields, so a hand-built stub is enough to
	// drive the contract test without booting React Query and nock. Cast
	// shape conformance at the boundary — the stub is intentionally narrower
	// than the full `UseInfiniteQueryResult`.
	return () =>
		( {
			data: { pages: [ { items: [], next_cursor: null, seen_at: null } ], pageParams: [] },
			isPending: false,
			isError: false,
			fetchNextPage: () => undefined,
			hasNextPage: false,
			isFetchingNextPage: false,
		} ) as unknown as ReturnType< UseSocialNotificationsInfiniteQuery< never > >;
}

describe.each< [ SocialNotificationsSource ] >( [
	[ 'atmosphere' ],
	[ 'mastodon' ],
	[ 'fediverse' ],
] )( 'SocialNotificationsPanel — source="%s"', ( source ) => {
	beforeEach( () => mockRecordReaderTracksEvent.mockClear() );

	it( 'invokes the provided hook with the connection id + filter', () => {
		const useNotificationsInfiniteQuery = jest.fn( makeStubHook() );
		renderWithProvider(
			<SocialNotificationsPanel
				connectionId={ 42 }
				source={ source }
				useNotificationsInfiniteQuery={ useNotificationsInfiniteQuery }
			/>
		);
		expect( useNotificationsInfiniteQuery ).toHaveBeenCalledWith( 42, { filter: 'all' } );
	} );

	it( 'fires calypso_reader_<source>_notifications_filter_changed on chip click', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsPanel
				connectionId={ 42 }
				source={ source }
				useNotificationsInfiniteQuery={ makeStubHook() }
			/>
		);

		await user.click( screen.getByRole( 'radio', { name: /^likes$/i } ) );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				`calypso_reader_${ source }_notifications_filter_changed`,
				{ connection_id: 42, filter: 'likes' }
			)
		);
	} );

	it( 're-invokes the hook with the new filter when the chip changes', async () => {
		const useNotificationsInfiniteQuery = jest.fn( makeStubHook() );
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsPanel
				connectionId={ 42 }
				source={ source }
				useNotificationsInfiniteQuery={ useNotificationsInfiniteQuery }
			/>
		);

		await user.click( screen.getByRole( 'radio', { name: /^likes$/i } ) );

		await waitFor( () =>
			expect( useNotificationsInfiniteQuery ).toHaveBeenCalledWith( 42, { filter: 'likes' } )
		);
	} );
} );
