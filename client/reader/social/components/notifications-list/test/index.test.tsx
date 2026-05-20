/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialNotificationsList } from '../index';
import type { AtmosphereNotification } from '@automattic/api-core';

const baseItem: AtmosphereNotification = {
	id: 'a',
	protocol_type: 'like',
	canonical_type: 'like',
	actor: {
		handle: 'jane.bsky.social',
		display_name: 'Jane',
		avatar_url: null,
		profile_uri: 'at://did:plc:jane',
	},
	target: { kind: 'post', uri: 'at://post', excerpt: 'hello' },
	target_url: 'https://bsky.app/profile/me/post/3k',
	created_at: '2026-05-11T12:34:56Z',
	is_read: false,
};

function makeNotification( overrides: Partial< AtmosphereNotification > ): AtmosphereNotification {
	return { ...baseItem, ...overrides };
}

const defaultProps = {
	items: [ baseItem ],
	isLoading: false,
	isError: false,
	hasMore: false,
	onLoadMore: jest.fn(),
	filter: 'all' as const,
	onFilterChange: jest.fn(),
};

describe( 'SocialNotificationsList', () => {
	it( 'renders an empty state when items is empty and not loading', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } items={ [] } /> );
		expect( screen.getByText( /no notifications yet/i ) ).toBeVisible();
	} );

	it( 'renders a spinner when loading the first page', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } items={ [] } isLoading /> );
		expect( screen.getByRole( 'status' ) ).toBeVisible();
	} );

	it( 'renders an error state when isError is true with no items', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } items={ [] } isError /> );
		expect( screen.getByText( /couldn’t load notifications/i ) ).toBeVisible();
	} );

	it( 'renders items', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } /> );
		expect( screen.getByText( /liked your post/i ) ).toBeVisible();
	} );

	it( 'shows Load more when hasMore is true and triggers onLoadMore', async () => {
		const onLoadMore = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsList { ...defaultProps } hasMore onLoadMore={ onLoadMore } />
		);
		await user.click( screen.getByRole( 'button', { name: /load more/i } ) );
		expect( onLoadMore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not render Load more when hasMore is false', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } hasMore={ false } /> );
		expect( screen.queryByRole( 'button', { name: /load more/i } ) ).toBeNull();
	} );

	it( 'disables Load more while fetching the next page', () => {
		renderWithProvider( <SocialNotificationsList { ...defaultProps } hasMore isLoadingMore /> );
		expect( screen.getByRole( 'button', { name: /load more/i } ) ).toBeDisabled();
	} );

	it( 'shows a retry footer when pagination errors with items present', async () => {
		const onLoadMore = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsList { ...defaultProps } hasMore isError onLoadMore={ onLoadMore } />
		);
		expect( screen.getByText( /couldn’t load more notifications/i ) ).toBeVisible();
		// The plain "Load more" button is replaced by the retry CTA.
		expect( screen.queryByRole( 'button', { name: /load more/i } ) ).toBeNull();
		await user.click( screen.getByRole( 'button', { name: /try again/i } ) );
		expect( onLoadMore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders the filter bar with the active option', () => {
		renderWithProvider(
			<SocialNotificationsList
				{ ...defaultProps }
				items={ [] }
				filter="likes"
				onFilterChange={ jest.fn() }
			/>
		);
		expect( screen.getByRole( 'radio', { name: /^likes$/i } ) ).toBeChecked();
	} );

	it( 'shows a per-filter empty-state message', () => {
		renderWithProvider(
			<SocialNotificationsList
				{ ...defaultProps }
				items={ [] }
				filter="likes"
				onFilterChange={ jest.fn() }
			/>
		);
		expect( screen.getByText( /no likes yet/i ) ).toBeVisible();
	} );

	it( 'does not render a Today divider when every item is in Today', () => {
		// Single bucket → divider should be hidden.
		const item1 = makeNotification( {
			id: 'a',
			created_at: new Date().toISOString(),
		} );
		const item2 = makeNotification( {
			id: 'b',
			created_at: new Date().toISOString(),
		} );
		renderWithProvider(
			<SocialNotificationsList
				{ ...defaultProps }
				items={ [ item1, item2 ] }
				filter="all"
				onFilterChange={ jest.fn() }
			/>
		);
		expect( screen.queryByRole( 'heading', { name: /today/i, level: 3 } ) ).toBeNull();
	} );

	it( 'does not emit duplicate-key warnings when a bucket re-appears in non-monotonic input', () => {
		// Some wire orderings (paginated pages re-merged out-of-order, backend
		// quirks) can interleave buckets — e.g. earlier → this_week → earlier.
		// The divider key must stay unique across such layouts so React doesn't
		// drop or duplicate dividers. See the divider-key construction in the
		// list renderer.
		const now = Date.now();
		const days = ( n: number ) => new Date( now - n * 24 * 60 * 60 * 1000 ).toISOString();
		const items = [
			makeNotification( { id: 'a', created_at: days( 10 ) } ), // earlier
			makeNotification( { id: 'b', created_at: days( 3 ) } ), // this_week
			makeNotification( { id: 'c', created_at: days( 15 ) } ), // earlier (again)
		];
		const errorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		try {
			renderWithProvider(
				<SocialNotificationsList
					{ ...defaultProps }
					items={ items }
					filter="all"
					onFilterChange={ jest.fn() }
				/>
			);
			const dupKeyCalls = errorSpy.mock.calls.filter( ( args ) =>
				args.some( ( arg ) => String( arg ).includes( 'two children with the same key' ) )
			);
			expect( dupKeyCalls ).toEqual( [] );
		} finally {
			errorSpy.mockRestore();
		}
	} );
} );
