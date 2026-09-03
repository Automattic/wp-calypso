import { getOnboardingStepperPosition } from '../step-counter-config';

describe( 'getOnboardingStepperPosition', () => {
	it( 'numbers the plans step when a skipping visit deep-links to it', () => {
		expect( getOnboardingStepperPosition( 'plans', true ) ).toEqual( { current: 2, total: 3 } );
	} );

	it( 'drops the plans step from the visits that pass it by', () => {
		expect( getOnboardingStepperPosition( 'domain', true ) ).toEqual( { current: 1, total: 2 } );
		expect( getOnboardingStepperPosition( 'checkout', true ) ).toEqual( { current: 2, total: 2 } );
	} );
} );
