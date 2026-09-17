import { groupToolsByGroup, groupToolsBySubCategory } from '../groups';

const GROUPS = [
	{ name: 'content-authoring', label: 'Content Authoring', description: 'Create posts.', order: 0 },
	{ name: 'site', label: 'Site', description: 'Manage site settings.', order: 1 },
	{ name: 'account', label: 'Account', description: 'Manage account settings.', order: 2 },
];

describe( 'client/me/mcp/groups', () => {
	describe( 'groupToolsByGroup', () => {
		it( 'groups tools by their group field, ordered by descriptor order', () => {
			const tools = [
				[ 'wpcom-mcp/posts-create', { group: 'content-authoring' } ],
				[ 'wpcom-mcp/site-settings-update', { group: 'site' } ],
				[ 'wpcom-mcp/posts-update', { group: 'content-authoring' } ],
			];

			const groups = groupToolsByGroup( tools, GROUPS );

			expect( groups.map( ( g ) => g.group?.name ) ).toEqual( [ 'content-authoring', 'site' ] );
			expect( groups[ 0 ].tools.map( ( [ id ] ) => id ) ).toEqual( [
				'wpcom-mcp/posts-create',
				'wpcom-mcp/posts-update',
			] );
			expect( groups[ 0 ].label ).toBe( 'Content Authoring' );
		} );

		it( 'skips descriptors with no matching tools', () => {
			const tools = [ [ 'wpcom-mcp/posts-create', { group: 'content-authoring' } ] ];

			const groups = groupToolsByGroup( tools, GROUPS );

			expect( groups ).toHaveLength( 1 );
			expect( groups[ 0 ].group?.name ).toBe( 'content-authoring' );
		} );

		it( 'buckets tools with no group (or an unknown group) into a trailing "Other" group', () => {
			const tools = [
				[ 'wpcom-mcp/standalone-tool', { group: null } ],
				[ 'wpcom-mcp/legacy-tool', { group: 'retired-facade' } ],
				[ 'wpcom-mcp/posts-create', { group: 'content-authoring' } ],
			];

			const groups = groupToolsByGroup( tools, GROUPS );

			expect( groups ).toHaveLength( 2 );
			const other = groups[ groups.length - 1 ];
			expect( other.group ).toBeNull();
			expect( other.tools.map( ( [ id ] ) => id ) ).toEqual( [
				'wpcom-mcp/standalone-tool',
				'wpcom-mcp/legacy-tool',
			] );
		} );

		it( 'returns an empty array when there are no tools', () => {
			expect( groupToolsByGroup( [], GROUPS ) ).toEqual( [] );
		} );
	} );

	describe( 'groupToolsBySubCategory', () => {
		it( 'places tools with no sub-category in a single trailing null bucket', () => {
			const tools = [
				[ 'wpcom-mcp/unknown-a', {} ],
				[ 'wpcom-mcp/unknown-b', {} ],
			];

			const result = groupToolsBySubCategory( tools );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].subCategory ).toBeNull();
			expect( result[ 0 ].tools.map( ( [ id ] ) => id ) ).toEqual( [
				'wpcom-mcp/unknown-a',
				'wpcom-mcp/unknown-b',
			] );
		} );

		it( 'separates tools into ordered sub-groups by API category', () => {
			const tools = [
				[ 'wpcom-mcp/list-comments', { category: 'comments' } ],
				[ 'wpcom-mcp/list-posts', { category: 'posts' } ],
				[ 'wpcom-mcp/create-post', { category: 'posts' } ],
			];

			const result = groupToolsBySubCategory( tools );

			// Posts should appear before Comments per FLAT_SUB_CATEGORY_ORDER
			expect( result[ 0 ].tools.every( ( [ , t ] ) => t.category === 'posts' ) ).toBe( true );
			expect( result[ 1 ].tools.every( ( [ , t ] ) => t.category === 'comments' ) ).toBe( true );
		} );

		it( 'puts unknown sub-categories after known ones, null bucket last', () => {
			const tools = [
				[ 'wpcom-mcp/no-category', {} ],
				[ 'wpcom-mcp/list-posts', { category: 'posts' } ],
			];

			const result = groupToolsBySubCategory( tools );

			expect( result[ 0 ].tools.map( ( [ id ] ) => id ) ).toEqual( [ 'wpcom-mcp/list-posts' ] );
			expect( result[ result.length - 1 ].subCategory ).toBeNull();
		} );
	} );
} );
