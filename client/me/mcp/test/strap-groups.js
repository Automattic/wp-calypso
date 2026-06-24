import { groupToolsByStrap } from '../strap-groups';

const STRAPS = [
	{ name: 'wpcom-mcp/content-authoring', label: 'Content Authoring', order: 0 },
	{ name: 'wpcom-mcp/site', label: 'Site', order: 1 },
	{ name: 'wpcom-mcp/account', label: 'Account', order: 2 },
];

describe( 'client/me/mcp/strap-groups', () => {
	describe( 'groupToolsByStrap', () => {
		it( 'groups tools by their strap field, ordered by descriptor order', () => {
			const tools = [
				[ 'wpcom-mcp/posts-create', { strap: 'wpcom-mcp/content-authoring' } ],
				[ 'wpcom-mcp/site-settings-update', { strap: 'wpcom-mcp/site' } ],
				[ 'wpcom-mcp/posts-update', { strap: 'wpcom-mcp/content-authoring' } ],
			];

			const groups = groupToolsByStrap( tools, STRAPS );

			expect( groups.map( ( g ) => g.strap?.name ) ).toEqual( [
				'wpcom-mcp/content-authoring',
				'wpcom-mcp/site',
			] );
			expect( groups[ 0 ].tools.map( ( [ id ] ) => id ) ).toEqual( [
				'wpcom-mcp/posts-create',
				'wpcom-mcp/posts-update',
			] );
			expect( groups[ 0 ].label ).toBe( 'Content Authoring' );
		} );

		it( 'skips descriptors with no matching tools', () => {
			const tools = [ [ 'wpcom-mcp/posts-create', { strap: 'wpcom-mcp/content-authoring' } ] ];

			const groups = groupToolsByStrap( tools, STRAPS );

			expect( groups ).toHaveLength( 1 );
			expect( groups[ 0 ].strap?.name ).toBe( 'wpcom-mcp/content-authoring' );
		} );

		it( 'buckets tools with no strap (or an unknown strap) into a trailing "Other" group', () => {
			const tools = [
				[ 'wpcom-mcp/standalone-tool', { strap: null } ],
				[ 'wpcom-mcp/legacy-tool', { strap: 'wpcom-mcp/retired-facade' } ],
				[ 'wpcom-mcp/posts-create', { strap: 'wpcom-mcp/content-authoring' } ],
			];

			const groups = groupToolsByStrap( tools, STRAPS );

			expect( groups ).toHaveLength( 2 );
			const other = groups[ groups.length - 1 ];
			expect( other.strap ).toBeNull();
			expect( other.tools.map( ( [ id ] ) => id ) ).toEqual( [
				'wpcom-mcp/standalone-tool',
				'wpcom-mcp/legacy-tool',
			] );
		} );

		it( 'returns an empty array when there are no tools', () => {
			expect( groupToolsByStrap( [], STRAPS ) ).toEqual( [] );
		} );
	} );
} );
