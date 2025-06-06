import hasGravatarDomainQuery from 'calypso/state/selectors/has-gravatar-domain-query';

describe( 'hasGravatarDomainQuery()', () => {
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

		expect( hasGravatarDomainQuery( state ) ).toBe( true );
	} );

	test( 'should return `true` if the state has the wrong Gravatar domain query', () => {
		const state = {
			route: {
				query: {
					current: {
						isGravatarDomain: '0',
					},
				},
			},
		};

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the Gravatar domain query', () => {
		const state = {
			route: {
				query: {
					current: {},
				},
			},
		};

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `current` query object', () => {
		const state = {
			route: {
				query: {},
			},
		};

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `query` object', () => {
		const state = {
			route: {},
		};

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state has no the `route` object', () => {
		const state = {};

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );

	test( 'should return `false` if the state is empty', () => {
		const state = undefined;

		expect( hasGravatarDomainQuery( state ) ).toBe( false );
	} );
} );
