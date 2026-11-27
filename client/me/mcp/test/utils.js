import { getGroupDescriptors, getGroupIntents, getSiteLevelEnabled } from '../utils';

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

	describe( 'getSiteLevelEnabled', () => {
		it.each( [
			[ 'no site entry', true, null, true ],
			[ 'missing override', true, {}, true ],
			[ 'reset override', true, { site_level_enabled: null }, true ],
			[ 'missing override with disabled default', false, {}, false ],
			[ 'explicitly enabled', false, { site_level_enabled: true }, true ],
			[ 'explicitly disabled', true, { site_level_enabled: false }, false ],
		] )( '%s', ( _name, defaultEnabled, siteEntry, expected ) => {
			const userSettings = {
				mcp_abilities: {
					site_level_enabled_default: defaultEnabled,
					sites: siteEntry === null ? [] : [ { blog_id: 123, ...siteEntry } ],
				},
			};
			expect( getSiteLevelEnabled( userSettings, 123 ) ).toBe( expected );
		} );
	} );
} );
