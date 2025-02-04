import getCurrentRoutePattern from 'calypso/state/selectors/get-current-route-pattern';

describe( 'getCurrentRoutePattern()', () => {
	test( 'it returns null when state is missing the path', () => {
		const state = {
			route: {},
		};

		expect( getCurrentRoutePattern( state ) ).toBeNull();
	} );

	test( 'it returns null when state is missing the site', () => {
		const state = {
			route: {
				path: {
					current: '/sites',
				},
			},
		};

		expect( getCurrentRoutePattern( state ) ).toBe( '/sites' );
	} );

	test( 'it replaces the site slug with :site', () => {
		const state = {
			route: {
				path: {
					current: '/test/url/testsite.blog',
				},
			},
		};

		expect( getCurrentRoutePattern( state ) ).toEqual( '/test/url/:site' );
	} );

	test( 'it replaces the site slug with :site in the middle', () => {
		const state = {
			route: {
				path: {
					current: '/test/testsite.blog/something',
				},
			},
		};

		expect( getCurrentRoutePattern( state ) ).toEqual( '/test/:site/something' );
	} );

	test( 'it replaces the site ID with :site', () => {
		const state = {
			route: {
				path: {
					current: '/test/url/12345',
				},
			},
		};

		expect( getCurrentRoutePattern( state ) ).toEqual( '/test/url/:site' );
	} );
} );
