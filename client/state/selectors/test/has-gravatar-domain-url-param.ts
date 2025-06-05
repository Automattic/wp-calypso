import hasGravatarDomainUrlParam from 'calypso/state/selectors/has-gravatar-domain-url-param';

describe( 'hasGravatarDomainUrlParam()', () => {
	test( 'should return `true` if the state has `isGravatarDomain=1` query parameter', () => {
		const state = {
			route: {
				query: {
					current: {
						isGravatarDomain: '1',
					},
				},
			},
		};

		expect( hasGravatarDomainUrlParam( state ) ).toBeTruthy();
	} );

	test( 'should return `true` if the state has `isGravatarDomain=0` query parameter', () => {
		const state = {
			route: {
				query: {
					current: {
						isGravatarDomain: '0',
					},
				},
			},
		};

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );

	test( 'should return `false` if the state does not have `isGravatarDomain=1` query parameter', () => {
		const state = {
			route: {
				query: {
					current: {},
				},
			},
		};

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );

	test( 'should return `false` if the state does not have the `current` query object', () => {
		const state = {
			route: {
				query: {},
			},
		};

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );

	test( 'should return `false` if the state does not have the `query` object', () => {
		const state = {
			route: {},
		};

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );

	test( 'should return `false` if the state does not have the `route` object', () => {
		const state = {};

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );

	test( 'should return `false` if the state is empty', () => {
		const state = undefined;

		expect( hasGravatarDomainUrlParam( state ) ).toBeFalsy();
	} );
} );
