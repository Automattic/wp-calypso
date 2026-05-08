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

		render(
			<SocialAccountList< FakeItem >
				query={ query }
				renderItem={ ( item ) => ( {
					avatarUrl: null,
					displayName: item.name,
					handle: `${ item.id }.test`,
					profileHref: `/profile/${ item.id }`,
				} ) }
				itemKey={ ( item ) => item.id }
				emptyTitle="No one yet"
				emptyLine="Be the first."
				protocolLabel="ATmosphere"
				protocolHomeURL="https://bsky.app"
				protocolHomeLabel="Bluesky"
			/>
		);

		expect( screen.getByText( 'Alice' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Bob' ) ).toBeInTheDocument();
	} );

	it( 'shows the empty state when items is empty', () => {
		const query = buildQuery( {} );
		render(
			<SocialAccountList< FakeItem >
				query={ query }
				renderItem={ ( item ) => ( {
					avatarUrl: null,
					displayName: item.name,
					handle: `${ item.id }.test`,
					profileHref: `/profile/${ item.id }`,
				} ) }
				itemKey={ ( item ) => item.id }
				emptyTitle="No one yet"
				emptyLine="Be the first."
				protocolLabel="ATmosphere"
				protocolHomeURL="https://bsky.app"
				protocolHomeLabel="Bluesky"
			/>
		);
		expect( screen.getByText( 'No one yet' ) ).toBeInTheDocument();
	} );
} );
