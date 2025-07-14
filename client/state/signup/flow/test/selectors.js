import { getCurrentFlowName, getIsOnboardingAffiliateFlow } from '../selectors';

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
	// Store original window object
	const originalWindow = global.window;

	afterEach( () => {
		jest.clearAllMocks();
		// Restore original window
		global.window = originalWindow;
	} );

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
		};

		// Mock window with realistic URL structure
		global.window = {
			location: {
				href: 'https://example.com/setup/onboarding-unified?source=affiliate',
				pathname: '/setup/onboarding-unified',
				search: '?source=affiliate',
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
