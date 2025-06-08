import hasGravatarDomainQueryParam from 'calypso/state/selectors/has-gravatar-domain-query-param';

describe( 'hasGravatarDomainQueryParam()', () => {
	test( 'should return `true` if the state has the right Gravatar domain query', () => {
		const state = {
			route: {
				query: {
					current: {
						isGravatarDomain: '1',
					},
				},
			},
		};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( true );
	} );

	test( 'should return `false` if the state has the wrong Gravatar domain query', () => {
		const state = {
			route: {
				query: {
					current: {
						isGravatarDomain: '0',
					},
				},
			},
		};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the Gravatar domain query', () => {
		const state = {
			route: {
				query: {
					current: {},
				},
			},
		};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `current` query object', () => {
		const state = {
			route: {
				query: {},
			},
		};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `query` object', () => {
		const state = {
			route: {},
		};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `route` object', () => {
		const state = {};

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state is empty', () => {
		const state = undefined;

		expect( hasGravatarDomainQueryParam( state ) ).toBe( false );
	} );
} );
