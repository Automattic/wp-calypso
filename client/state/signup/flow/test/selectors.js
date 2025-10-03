import {
	getCurrentFlowName,
	getIsOnboardingAffiliateFlow,
	getIsOnboardingUnifiedFlow,
} from '../selectors';

describe( 'getCurrentFlowName()', () => {
	test( 'should return the current flow', () => {
		const currentFlowName = 'sultana_wetsuit';
		expect(
			getCurrentFlowName( {
				signup: {
					flow: {
						currentFlowName,
					},
				},
			} )
		).toEqual( currentFlowName );
	} );

	test( 'should default to be an empty string', () => {
		expect( getCurrentFlowName( {} ) ).toEqual( '' );
	} );
} );

describe( 'getIsOnboardingAffiliateFlow()', () => {
	test( 'should return true for legacy onboarding-affiliate flow', () => {
		const state = {
			signup: {
				flow: {
					currentFlowName: 'onboarding-affiliate',
				},
			},
		};

		expect( getIsOnboardingAffiliateFlow( state ) ).toBe( true );
	} );

	test( 'should return true for onboarding-unified flow with source=affiliate', () => {
		const state = {
			signup: {
				flow: {
					currentFlowName: '',
				},
			},
			route: {
				path: {
					current: '/setup/onboarding-unified',
				},
				query: {
					current: {
						source: 'affiliate',
					},
				},
			},
		};

		expect( getIsOnboardingAffiliateFlow( state ) ).toBe( true );
	} );

	test( 'should return false for non-affiliate flows', () => {
		const state = {
			signup: {
				flow: {
					currentFlowName: 'other-flow',
				},
			},
		};

		expect( getIsOnboardingAffiliateFlow( state ) ).toBe( false );
	} );

	test( 'should return false when state has no signup data', () => {
		expect( getIsOnboardingAffiliateFlow( {} ) ).toBe( false );
	} );
} );

describe( 'getIsOnboardingUnifiedFlow()', () => {
	test( 'should return true for onboarding-unified flow without source parameter', () => {
		const state = {
			route: {
				path: {
					current: '/setup/onboarding-unified',
				},
				query: {
					current: {},
				},
			},
		};

		expect( getIsOnboardingUnifiedFlow( state ) ).toBe( true );
	} );

	test( 'should return true for onboarding-unified flow with matching source', () => {
		const state = {
			route: {
				path: {
					current: '/setup/onboarding-unified',
				},
				query: {
					current: {
						source: 'pm',
					},
				},
			},
		};

		expect( getIsOnboardingUnifiedFlow( state, 'pm' ) ).toBe( true );
	} );

	test( 'should return false for onboarding-unified flow with non-matching source', () => {
		const state = {
			route: {
				path: {
					current: '/setup/onboarding-unified',
				},
				query: {
					current: {
						source: 'pm',
					},
				},
			},
		};

		expect( getIsOnboardingUnifiedFlow( state, 'other-source' ) ).toBe( false );
	} );

	test( 'should return false for non-onboarding-unified flow', () => {
		const state = {
			route: {
				path: {
					current: '/setup/other-flow',
				},
				query: {
					current: {},
				},
			},
		};

		expect( getIsOnboardingUnifiedFlow( state ) ).toBe( false );
	} );

	test( 'should return false when there is no current route', () => {
		const state = {
			route: {
				path: {
					current: null,
				},
			},
		};

		expect( getIsOnboardingUnifiedFlow( state ) ).toBe( false );
	} );

	test( 'should return false when state has no route data', () => {
		expect( getIsOnboardingUnifiedFlow( {} ) ).toBe( false );
	} );
} );
