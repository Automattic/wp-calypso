/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCurrentRouteUrl from 'calypso/state/selectors/get-current-route-url';

describe( 'getCurrentRouteUrl()', () => {
	const route = {
		path: {
			current: '/test/url/testsite.blog',
		},
		query: {
			current: {
				_timestamp: Date.now(),
				foo: 'bar',
				bar: 'foo',
			},
		},
	};

	test( 'it returns the full path & query when defined', () => {
		const state = {
			route,
		};

		expect( getCurrentRouteUrl( state ) ).to.equal( '/test/url/testsite.blog?foo=bar&bar=foo' );
	} );

	test( 'it returns undefined when current path is falsely', () => {
		const state = {
			route: {
				...route,
				path: {
					current: null,
				},
			},
		};

		expect( getCurrentRouteUrl( state ) ).to.equal( undefined );
	} );

	test( 'it returns the path when current query is falsely', () => {
		const state = {
			route: {
				...route,
				query: {
					current: null,
				},
			},
		};

		expect( getCurrentRouteUrl( state ) ).to.equal( '/test/url/testsite.blog' );
	} );
} );
