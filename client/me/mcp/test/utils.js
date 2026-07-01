import { getGroupDescriptors, getGroupIntents } from '../utils';

describe( 'client/me/mcp/utils', () => {
	describe( 'getGroupDescriptors', () => {
		it( 'returns the group descriptors sorted by order', () => {
			const userSettings = {
				mcp_abilities: {
					groups: [
						{ name: 'site', label: 'Site', description: 'Manage sites.', order: 1 },
						{
							name: 'content-authoring',
							label: 'Content Authoring',
							description: 'Create posts.',
							order: 0,
						},
					],
				},
			};

			expect( getGroupDescriptors( userSettings ).map( ( s ) => s.name ) ).toEqual( [
				'content-authoring',
				'site',
			] );
		} );

		it( 'returns an empty array when groups are missing', () => {
			expect( getGroupDescriptors( {} ) ).toEqual( [] );
			expect( getGroupDescriptors( { mcp_abilities: {} } ) ).toEqual( [] );
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
} );
