/** @format */

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
	HAPPYCHAT_SKILLS,
} from 'state/happychat/constants';
import getSkills from 'state/happychat/selectors/get-skills';

describe( '#getSkills()', () => {
	let _window; // Keep a copy of the original window if any
	const uiState = {
		ui: {
			section: {
				name: 'reader',
			},
		},
	};

	beforeEach( () => {
		_window = global.window;
		global.window = {};
	} );

	afterEach( () => {
		global.window = _window;
	} );

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
			[ HAPPYCHAT_SKILLS.PRODUCT ]: [ HAPPYCHAT_GROUP_WPCOM ],
			[ HAPPYCHAT_SKILLS.LANGUAGE ]: [ 'en' ],
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
			[ HAPPYCHAT_SKILLS.PRODUCT ]: [ HAPPYCHAT_GROUP_WPCOM ],
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
			[ HAPPYCHAT_SKILLS.PRODUCT ]: [ HAPPYCHAT_GROUP_JPOP ],
			[ HAPPYCHAT_SKILLS.LANGUAGE ]: [ 'fr' ],
		} );
	} );
} );
