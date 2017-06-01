/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getActionList,
	getCurrentStepIndex,
	getStepCountRemaining,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getActionList', () => {
		it( 'should access an existing action list', () => {
			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' } },
				{ description: 'Action Step 2', action: { type: 'ACTION2' } },
				{ description: 'Action Step 3', action: { type: 'ACTION3' } },
			];

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
			const fiveSecondsAgo = Date.now() - 5000;
			const threeSecondsAgo = Date.now() - 3000;
			const twoSecondsAgo = Date.now() - 2000;

			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' },
					startTime: fiveSecondsAgo, endTime: threeSecondsAgo },
				{ description: 'Action Step 2', action: { type: 'ACTION2' },
					startTime: twoSecondsAgo },
				{ description: 'Action Step 3', action: { type: 'ACTION3' } },
			];

			expect( getCurrentStepIndex( actionList ) ).to.equal( 1 );
		} );

		it( 'should return array length if all steps are complete', () => {
			const fiveSecondsAgo = Date.now() - 5000;
			const threeSecondsAgo = Date.now() - 3000;
			const twoSecondsAgo = Date.now() - 2000;
			const oneSecondAgo = Date.now() - 1000;

			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' },
					startTime: fiveSecondsAgo, endTime: threeSecondsAgo },
				{ description: 'Action Step 2', action: { type: 'ACTION2' },
					startTime: twoSecondsAgo, endTime: oneSecondAgo },
			];

			expect( getCurrentStepIndex( actionList ) ).to.equal( actionList.length );
		} );

		it( 'should return first step if no steps have been started', () => {
			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' } },
				{ description: 'Action Step 2', action: { type: 'ACTION2' } },
			];

			expect( getCurrentStepIndex( actionList ) ).to.equal( 0 );
		} );
	} );

	describe( 'getStepCountRemaining', () => {
		it( 'should return array length if no steps have been started', () => {
			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' } },
				{ description: 'Action Step 2', action: { type: 'ACTION2' } },
			];

			expect( getStepCountRemaining( actionList ) ).to.equal( actionList.length );
		} );

		it( 'should return array length if no steps have been yet completed', () => {
			const fiveSecondsAgo = Date.now() - 5000;

			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' },
					startTime: fiveSecondsAgo },
				{ description: 'Action Step 2', action: { type: 'ACTION2' } },
			];

			expect( getStepCountRemaining( actionList ) ).to.equal( actionList.length );
		} );

		it( 'should return zero if all steps are completed', () => {
			const fiveSecondsAgo = Date.now() - 5000;
			const threeSecondsAgo = Date.now() - 3000;
			const twoSecondsAgo = Date.now() - 2000;
			const oneSecondAgo = Date.now() - 1000;

			const actionList = [
				{ description: 'Action Step 1', action: { type: 'ACTION1' },
					startTime: fiveSecondsAgo, endTime: threeSecondsAgo },
				{ description: 'Action Step 2', action: { type: 'ACTION2' },
					startTime: twoSecondsAgo, endTime: oneSecondAgo },
			];

			expect( getStepCountRemaining( actionList ) ).to.equal( 0 );
		} );
	} );
} );

