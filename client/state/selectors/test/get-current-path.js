/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCurrentPath from 'state/selectors/get-current-path';

describe( 'getCurrentPath()', () => {
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

		expect( getCurrentPath( state, 12345 ) ).to.be.null;
	} );

	test( 'it returns null when state is missing the site', () => {
		const state = {
			ui: ui,
			sites: { items: {} },
		};

		expect( getCurrentPath( state, 12345 ) ).to.be.null;
	} );

	test( 'it replaces the site ID with :sideid', () => {
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

		expect( getCurrentPath( state, 12345 ) ).to.equal( '/test/url/:siteid' );
	} );
} );
