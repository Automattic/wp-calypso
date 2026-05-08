/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { SocialAccountList } from '../account-list';

interface FakeItem {
	id: string;
	name: string;
}

const buildQuery = (
	overrides: Partial< Parameters< typeof SocialAccountList< FakeItem > >[ 0 ][ 'query' ] >
) =>
	( {
		data: { pages: [ { items: [], cursor: null } ] },
		isPending: false,
		isError: false,
		error: null,
		hasNextPage: false,
		isFetchingNextPage: false,
		fetchNextPage: jest.fn(),
		refetch: jest.fn(),
		...overrides,
	} ) as Parameters< typeof SocialAccountList< FakeItem > >[ 0 ][ 'query' ];

const baseProps = {
	renderItem: ( item: FakeItem ) => ( {
		avatarUrl: null,
		displayName: item.name,
		handle: `${ item.id }.test`,
		profileHref: `/profile/${ item.id }`,
	} ),
	itemKey: ( item: FakeItem ) => item.id,
	emptyTitle: 'No one yet',
	emptyLine: 'Be the first.',
	protocolLabel: 'ATmosphere',
	protocolHomeURL: 'https://bsky.app',
	protocolHomeLabel: 'Bluesky',
} as const;

describe( 'SocialAccountList', () => {
	beforeEach( () => {
		mockAllIsIntersecting( false );
	} );

	it( 'renders rows produced by renderItem', () => {
		const query = buildQuery( {
			data: {
				pages: [
					{
						items: [
							{ id: '1', name: 'Alice' },
							{ id: '2', name: 'Bob' },
						] as FakeItem[],
						cursor: null,
					},
				],
			},
		} );

		render( <SocialAccountList< FakeItem > query={ query } { ...baseProps } /> );

		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( 'Bob' ) ).toBeVisible();
	} );

	it( 'shows the empty state when items is empty', () => {
		const query = buildQuery( {} );
		render( <SocialAccountList< FakeItem > query={ query } { ...baseProps } /> );
		expect( screen.getByText( 'No one yet' ) ).toBeVisible();
	} );

	it( 'skips pages whose items field is missing or malformed', () => {
		// Regression: a backend that returns the raw upstream array instead
		// of `{ items, cursor }` (or returns `items: undefined`/`null`) used
		// to flatMap into `[ undefined ]`, which then crashed renderItem
		// with "Cannot read properties of undefined".
		const query = buildQuery( {
			data: {
				pages: [
					// Malformed page: no `items` array.
					{} as unknown as { items: FakeItem[]; cursor: string | null },
					// Page with a falsy entry mixed in.
					{
						items: [
							null as unknown as FakeItem,
							{ id: '1', name: 'Alice' },
							undefined as unknown as FakeItem,
						],
						cursor: null,
					},
				],
			},
		} );

		render( <SocialAccountList< FakeItem > query={ query } { ...baseProps } /> );

		expect( screen.getByText( 'Alice' ) ).toBeVisible();
	} );

	describe( 'header', () => {
		it( 'omits the header when no header prop is passed', () => {
			const query = buildQuery( {} );
			const { container } = render(
				<SocialAccountList< FakeItem > query={ query } { ...baseProps } />
			);
			expect( container.querySelector( '.social-account-list-header' ) ).toBeNull();
			expect( container.querySelector( '.social-account-list-header-skeleton' ) ).toBeNull();
		} );

		it( 'renders the display name and the followers count', () => {
			const query = buildQuery( {} );
			render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: 'Alice Example',
						handle: 'alice.bsky.social',
						count: 1234,
						mode: 'followers',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByRole( 'heading', { name: 'Alice Example' } ) ).toBeVisible();
			expect( screen.getByText( '1,234 followers' ) ).toBeVisible();
		} );

		it( 'renders the following count', () => {
			const query = buildQuery( {} );
			render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: 'Alice Example',
						handle: 'alice.bsky.social',
						count: 328,
						mode: 'following',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByText( '328 following' ) ).toBeVisible();
		} );

		it( 'falls back to the handle when display name is null', () => {
			const query = buildQuery( {} );
			render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: null,
						handle: 'alice.bsky.social',
						count: 0,
						mode: 'followers',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByRole( 'heading', { name: '@alice.bsky.social' } ) ).toBeVisible();
		} );

		it( 'pluralizes the followers count for one and zero', () => {
			const query = buildQuery( {} );
			const { rerender } = render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: 'Alice',
						handle: 'alice.bsky.social',
						count: 1,
						mode: 'followers',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByText( '1 follower' ) ).toBeVisible();

			rerender(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: 'Alice',
						handle: 'alice.bsky.social',
						count: 0,
						mode: 'followers',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByText( '0 followers' ) ).toBeVisible();
		} );

		it( 'omits the count line when count is null but renders the heading', () => {
			const query = buildQuery( {} );
			render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: 'Alice',
						handle: 'alice.bsky.social',
						count: null,
						mode: 'following',
						isPending: false,
					} }
				/>
			);
			expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible();
			expect( screen.queryByText( /following$/ ) ).toBeNull();
		} );

		it( 'renders a layout-stable skeleton while pending', () => {
			const query = buildQuery( {} );
			const { container } = render(
				<SocialAccountList< FakeItem >
					query={ query }
					{ ...baseProps }
					header={ {
						displayName: null,
						handle: 'alice.bsky.social',
						count: null,
						mode: 'followers',
						isPending: true,
					} }
				/>
			);
			expect( container.querySelector( '.social-account-list-header-skeleton' ) ).not.toBeNull();
			expect( container.querySelector( '.social-account-list-header' ) ).toBeNull();
		} );
	} );
} );
