import { getSignupProgress, isPlanStepExistsAndSkipped } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty, plain object as a default state', () => {
		const state = { signup: undefined };
		expect( getSignupProgress( state ) ).toEqual( {} );
	} );

	test( 'should select progress from the state', () => {
		const progress = {
			'site-selection': {
				status: 'completed',
				stepName: 'site-selection',
			},
		};
		const state = { signup: { progress } };

		expect( getSignupProgress( state ) ).toEqual( progress );
	} );

	test( 'isPlanStepExistsAndSkipped : An aliased skipped step should return true', () => {
		const progress = {
			'plans-site-selected': {
				wasSkipped: true,
			},
		};
		const state = { signup: { progress } };

		expect( isPlanStepExistsAndSkipped( state ) ).toEqual( true );
	} );

	test( 'isPlanStepExistsAndSkipped : An aliased unskipped step should return true', () => {
		const progress = {
			'plans-site-selected': {
				wasSkipped: false,
			},
		};
		const state = { signup: { progress } };

		expect( isPlanStepExistsAndSkipped( state ) ).toEqual( false );
	} );

	test( 'isPlanStepExistsAndSkipped : Should return false if no plans step in progress', () => {
		const progress = {
			'domain-only': {
				wasSkipped: false,
			},
		};
		const state = { signup: { progress } };

		expect( isPlanStepExistsAndSkipped( state ) ).toEqual( false );
	} );
} );
