import { getGroupIntents, getStrapDescriptors, strapGroupKey } from '../utils';

describe( 'client/me/mcp/utils', () => {
	describe( 'getStrapDescriptors', () => {
		it( 'returns the strap descriptors sorted by order', () => {
			const userSettings = {
				mcp_abilities: {
					straps: [
						{ name: 'wpcom-mcp/site', label: 'Site', order: 1 },
						{ name: 'wpcom-mcp/content-authoring', label: 'Content Authoring', order: 0 },
					],
				},
			};

			expect( getStrapDescriptors( userSettings ).map( ( s ) => s.name ) ).toEqual( [
				'wpcom-mcp/content-authoring',
				'wpcom-mcp/site',
			] );
		} );

		it( 'returns an empty array when straps are missing', () => {
			expect( getStrapDescriptors( {} ) ).toEqual( [] );
			expect( getStrapDescriptors( { mcp_abilities: {} } ) ).toEqual( [] );
		} );
	} );

	describe( 'getGroupIntents', () => {
		it( 'returns the stored group intents', () => {
			const userSettings = { mcp_abilities: { group_intents: { read: true, write: false } } };
			expect( getGroupIntents( userSettings ) ).toEqual( { read: true, write: false } );
		} );

		it( 'returns an empty object when group intents are missing', () => {
			expect( getGroupIntents( {} ) ).toEqual( {} );
		} );
	} );

	describe( 'strapGroupKey', () => {
		it( 'prefixes the strap name with "strap:"', () => {
			expect( strapGroupKey( 'wpcom-mcp/site' ) ).toBe( 'strap:wpcom-mcp/site' );
		} );
	} );
} );
