/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_GROUP_JPOP,
	HAPPYCHAT_SKILL_PRODUCT,
	HAPPYCHAT_SKILL_LANGUAGE,
} from 'calypso/state/happychat/constants';
import getSkills from 'calypso/state/happychat/selectors/get-skills';

describe( '#getSkills()', () => {
	const uiState = {
		ui: {
			section: {
				name: 'reader',
			},
		},
	};

	test( 'should return default product for no sites', () => {
		const siteId = 1;
		const state = {
			...uiState,
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'en' },
				},
			},
			currentUser: {
				id: 73705554,
			},
			sites: {
				items: {},
			},
		};
		expect( getSkills( state, siteId ) ).to.eql( {
			[ HAPPYCHAT_SKILL_PRODUCT ]: [ HAPPYCHAT_GROUP_WPCOM ],
			[ HAPPYCHAT_SKILL_LANGUAGE ]: [ 'en' ],
		} );
	} );

	test( 'should ignore language if not set', () => {
		const siteId = 1;
		const state = {
			...uiState,
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014' },
				},
			},
			currentUser: {
				id: 73705554,
			},
			sites: {
				items: {},
			},
		};
		expect( getSkills( state, siteId ) ).to.eql( {
			[ HAPPYCHAT_SKILL_PRODUCT ]: [ HAPPYCHAT_GROUP_WPCOM ],
		} );
	} );

	test( 'should return both product and language', () => {
		const siteId = 1;
		const state = {
			...uiState,
			users: {
				items: {
					1: { ID: 1, login: 'testonesite2014', localeSlug: 'fr' },
				},
			},
			currentUser: {
				id: 1,
				capabilities: {
					[ siteId ]: {
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						jetpack: true,
						plan: {
							product_id: 2005,
							product_slug: 'jetpack_personal',
						},
					},
				},
			},
		};

		expect( getSkills( state, siteId ) ).to.eql( {
			[ HAPPYCHAT_SKILL_PRODUCT ]: [ HAPPYCHAT_GROUP_JPOP ],
			[ HAPPYCHAT_SKILL_LANGUAGE ]: [ 'fr' ],
		} );
	} );
} );
