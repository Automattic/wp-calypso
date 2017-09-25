/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import { getActionList, getCurrentStepIndex, getTotalStepCount, getStepCountRemaining } from '../selectors';
import * as fxt from './fixtures';

describe( 'selectors', () => {
	describe( 'getActionList', () => {
		it( 'should access an existing action list', () => {
			const actionList = {
				prevSteps: [
					{ description: fxt.stepA.description, startTime: fxt.time.stepAStart, endTime: fxt.time.stepAEnd },
				],
				currentStep: { description: fxt.stepB.description, startTime: fxt.time.stepBStart },
				nextSteps: [
					{ description: fxt.stepC.description },
				],
			};

			const rootState = {};
			set( rootState, 'extensions.woocommerce.actionList', actionList );

			expect( getActionList( rootState ) ).to.equal( actionList );
		} );

		it( 'should return null if there is no action list', () => {
			const rootState = { extensions: { woocommerce: {} } };

			expect( getActionList( rootState ) ).to.equal( null );
		} );
	} );

	describe( 'getCurrentStepIndex', () => {
		it( 'should return the currently running step in the action list', () => {
			const actionList = {
				prevSteps: [
					{ description: fxt.stepA.description, startTime: fxt.time.stepAStart, endTime: fxt.time.stepAEnd },
				],
				currentStep: { description: fxt.stepB.description, startTime: fxt.time.stepBStart },
				nextSteps: [
					{ description: fxt.stepC.description },
				],
			};

			expect( getCurrentStepIndex( actionList ) ).to.equal( 2 );
		} );

		it( 'should return the last run step in the action list if there is no current step', () => {
			const actionList = {
				prevSteps: [
					{ description: fxt.stepA.description, startTime: fxt.time.stepAStart, endTime: fxt.time.stepAEnd },
					{ description: fxt.stepB.description, startTime: fxt.time.stepBStart, endTime: fxt.time.stepBEnd },
				],
				currentStep: null,
				nextSteps: [
					{ description: fxt.stepC.description },
				],
			};

			expect( getCurrentStepIndex( actionList ) ).to.equal( 2 );
		} );

		it( 'should return zero if no steps have been started', () => {
			const actionList = {
				nextSteps: [
					{ description: fxt.stepA.description },
					{ description: fxt.stepB.description },
					{ description: fxt.stepC.description },
				],
			};

			expect( getCurrentStepIndex( actionList ) ).to.equal( 0 );
		} );
	} );

	describe( 'getTotalStepCount', () => {
		it( 'should return a count of all previous, current, and next steps', () => {
			const actionList = {
				prevSteps: [
					{ description: fxt.stepA.description, startTime: fxt.time.stepAStart, endTime: fxt.time.stepAEnd },
				],
				currentStep: { description: fxt.stepB.description, startTime: fxt.time.stepBStart },
				nextSteps: [
					{ description: fxt.stepC.description },
				],
			};

			expect( getTotalStepCount( actionList ) ).to.equal( 3 );
		} );

		it( 'should handle an empty prevSteps list', () => {
			const actionList = {
				prevSteps: [
				],
				currentStep: { description: fxt.stepB.description, startTime: fxt.time.stepBStart },
				nextSteps: [
					{ description: fxt.stepC.description },
				],
			};

			expect( getTotalStepCount( actionList ) ).to.equal( 2 );
		} );
	} );

	describe( 'getStepCountRemaining', () => {
		it( 'should return array length if no steps have been started', () => {
			const actionList = {
				nextSteps: [
					{ description: fxt.stepA.description },
					{ description: fxt.stepB.description },
					{ description: fxt.stepC.description },
				],
			};

			expect( getStepCountRemaining( actionList ) ).to.equal( 3 );
		} );

		it( 'should return array length if no steps have been yet completed', () => {
			const actionList = {
				prevSteps: [
				],
				currentStep: { description: fxt.stepA.description, startTime: fxt.time.stepAStart },
				nextSteps: [
					{ description: fxt.stepB.description },
					{ description: fxt.stepC.description },
				],
			};

			expect( getStepCountRemaining( actionList ) ).to.equal( 3 );
		} );

		it( 'should return zero if all steps are completed', () => {
			const actionList = {
				prevSteps: [
					{ description: fxt.stepA.description, startTime: fxt.time.stepAStart, endTime: fxt.time.stepAEnd },
					{ description: fxt.stepB.description, startTime: fxt.time.stepBStart, endTime: fxt.time.stepBEnd },
					{ description: fxt.stepC.description, startTime: fxt.time.stepCStart, endTime: fxt.time.stepCEnd },
				],
				currentStep: null,
				nextSteps: [],
			};

			expect( getStepCountRemaining( actionList ) ).to.equal( 0 );
		} );
	} );
} );

