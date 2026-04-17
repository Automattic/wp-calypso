import { parseFediverseHandle, publicListItemsToFediAccounts } from '../fedi-account-mapper';
import type { PublicListItem } from '../use-public-list-query';

describe( 'parseFediverseHandle', () => {
	test( 'parses a handle without leading @', () => {
		expect( parseFediverseHandle( 'alice@example.social' ) ).toEqual( {
			username: 'alice',
			instance: 'example.social',
		} );
	} );

	test( 'parses a handle with leading @', () => {
		expect( parseFediverseHandle( '@alice@example.social' ) ).toEqual( {
			username: 'alice',
			instance: 'example.social',
		} );
	} );

	test( 'keeps dots and subdomains in the instance', () => {
		expect( parseFediverseHandle( '@bob@a.b.example.social' ) ).toEqual( {
			username: 'bob',
			instance: 'a.b.example.social',
		} );
	} );

	test( 'preserves dots, hyphens, and underscores in the username', () => {
		expect( parseFediverseHandle( '@first.last_name-1@example.social' ) ).toEqual( {
			username: 'first.last_name-1',
			instance: 'example.social',
		} );
	} );

	test( 'returns null when there is no instance separator', () => {
		expect( parseFediverseHandle( 'alice' ) ).toBeNull();
		expect( parseFediverseHandle( '@alice' ) ).toBeNull();
	} );

	test( 'returns null for an empty string', () => {
		expect( parseFediverseHandle( '' ) ).toBeNull();
	} );

	test( 'returns null when the username is empty', () => {
		expect( parseFediverseHandle( '@@example.social' ) ).toBeNull();
	} );
} );

function makeItem( overrides: Partial< PublicListItem > ): PublicListItem {
	return {
		blog_id: null,
		feed_id: 0,
		site_name: '',
		site_url: '',
		site_icon: null,
		fediverse_handle: null,
		fediverse_handle_url: null,
		...overrides,
	};
}

describe( 'publicListItemsToFediAccounts', () => {
	test( 'skips items without a fediverse handle', () => {
		const items = [ makeItem( { fediverse_handle: null } ), makeItem( { fediverse_handle: '' } ) ];
		expect( publicListItemsToFediAccounts( items ) ).toEqual( [] );
	} );

	test( 'skips items with an unparseable handle', () => {
		const items = [ makeItem( { fediverse_handle: 'not-a-handle' } ) ];
		expect( publicListItemsToFediAccounts( items ) ).toEqual( [] );
	} );

	test( 'maps valid items to FediAccount objects', () => {
		const items = [
			makeItem( {
				site_name: 'Alice Blog',
				site_url: 'https://alice.example',
				fediverse_handle: '@alice@example.social',
			} ),
		];
		expect( publicListItemsToFediAccounts( items ) ).toEqual( [
			{
				username: 'alice',
				instance: 'example.social',
				displayName: 'Alice Blog',
				bio: '',
				avatarUrl: '',
				feedUrl: 'https://alice.example',
			},
		] );
	} );

	test( 'filters out invalid entries while keeping valid ones', () => {
		const items = [
			makeItem( { fediverse_handle: null } ),
			makeItem( {
				site_name: 'Bob',
				fediverse_handle: '@bob@example.social',
			} ),
			makeItem( { fediverse_handle: 'broken' } ),
			makeItem( {
				site_name: 'Carol',
				fediverse_handle: '@carol@example.social',
			} ),
		];
		const result = publicListItemsToFediAccounts( items );
		expect( result ).toHaveLength( 2 );
		expect( result.map( ( a ) => a.username ) ).toEqual( [ 'bob', 'carol' ] );
	} );

	test( 'leaves feedUrl undefined when site_url is missing', () => {
		const items = [
			makeItem( {
				site_name: 'Dave',
				site_url: '',
				fediverse_handle: '@dave@example.social',
			} ),
		];
		expect( publicListItemsToFediAccounts( items )[ 0 ].feedUrl ).toBeUndefined();
	} );
} );
