/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';

describe( 'getCurrentRouteParameterized()', () => {
	const ui = {
		route: {
			path: {
				current: '/test/url/testsite.blog',
			},
		},
	};

	const sites = {
		items: { '12345': { URL: 'http://testsite.blog' } },
	};

	test( 'it returns null when state is missing the path', () => {
		const state = {
			ui: {},
			sites: sites,
		};

		expect( getCurrentRouteParameterized( state, 12345 ) ).to.be.null;
	} );

	test( 'it returns null when state is missing the site', () => {
		const state = {
			ui: ui,
			sites: { items: {} },
		};

		expect( getCurrentRouteParameterized( state, 12345 ) ).to.be.null;
	} );

	test( 'it replaces the site slug with :site', () => {
		const state = {
			ui,
			sites,
		};

		expect( getCurrentRouteParameterized( state, 12345 ) ).to.equal( '/test/url/:site' );
	} );

	test( 'it replaces the site ID with :siteid', () => {
		const state = {
			ui: {
				route: {
					path: {
						current: '/test/url/12345',
					},
				},
			},
			sites: sites,
		};

		expect( getCurrentRouteParameterized( state, 12345 ) ).to.equal( '/test/url/:siteid' );
	} );
} );
