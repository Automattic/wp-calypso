import { isFirstContactStepComplete } from '../is-first-contact-step-complete';

describe( 'isFirstContactStepComplete', () => {
	it( 'is true when moving manually from step 1 to step 2', () => {
		expect(
			isFirstContactStepComplete( {
				stepNumber: 2,
				previousStepNumber: 1,
				contactDetailsType: 'domain',
			} )
		).toBe( true );
	} );

	it( 'is true when auto-completion batches step 1 straight to no active step', () => {
		expect(
			isFirstContactStepComplete( {
				stepNumber: 0,
				previousStepNumber: 1,
				contactDetailsType: 'tax',
			} )
		).toBe( true );
	} );

	it( 'is false when there is no contact step and payment is step 1', () => {
		expect(
			isFirstContactStepComplete( {
				stepNumber: 0,
				previousStepNumber: 1,
				contactDetailsType: 'none',
			} )
		).toBe( false );
	} );

	it( 'is false for other transitions', () => {
		expect(
			isFirstContactStepComplete( {
				stepNumber: 1,
				previousStepNumber: 2,
				contactDetailsType: 'tax',
			} )
		).toBe( false );
		expect(
			isFirstContactStepComplete( {
				stepNumber: 0,
				previousStepNumber: 2,
				contactDetailsType: 'tax',
			} )
		).toBe( false );
		expect(
			isFirstContactStepComplete( {
				stepNumber: null,
				previousStepNumber: 1,
				contactDetailsType: 'tax',
			} )
		).toBe( false );
	} );
} );
