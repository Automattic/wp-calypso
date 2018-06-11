/** @format */

/**
 * Internal dependencies
 */
import {
	// addStorableDependencies,
	addTimestamp,
	// processedSignupStep,
	// processSignupStep,
	// propagateSignupError,
	// provideDependencies,
	// saveSignupStep,
	// submitSignupStep,
} from '../actions';
// import { SIGNUP_PROGRESS_UPDATE, SIGNUP_COMPLETE_RESET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'helper function: addStorableDependencies', () => {
		// test()
	} );

	describe( 'helper function: addTimestamp', () => {
		test( 'adds the current UNIX time to the lastUpdated key to provided step', () => {
			const step = { stepName: 'site-selection' };
			const processedStep = addTimestamp( step );
			expect( processedStep.lastUpdated ).toBeDefined();
			expect( processedStep.lastUpdated ).toBeGreaterThan( 1514764800 ); // 2018-01-01 00:00:00
		} );
	} );
} );
