/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { useNock } from 'test/helpers/use-nock';

export const generateSuccessAndFailedTestsForThunk = ( {
	testBaseName,
	nockSettings,
	thunk,
	preCondition,
	postConditionSuccess,
	postConditionFailed
} ) => {
	const {
		method,
		endpoint,
		successResponse,
		errorResponse,
	} = nockSettings;

	const apiUrl = 'https://public-api.wordpress.com:443';

	describe( testBaseName + ' success', () => {
		useNock( ( nock ) => {
			nock( apiUrl )
				[ method ]( endpoint )
				.reply( 200, successResponse );
		} );

		it( 'should be successful.', () => {
			const action = thunk();

			preCondition();

			return action.then( postConditionSuccess );
		} );
	} );

	describe( testBaseName + ' fail', () => {
		useNock( ( nock ) => {
			nock( apiUrl )
				[ method ]( endpoint )
				.reply( errorResponse.status, errorResponse );
		} );

		it( 'should be failed', () => {
			const action = thunk();

			preCondition();

			return action.then( postConditionFailed );
		} );
	} );
};

export const generateActionInProgressStateFlagTests = ( stateKey, reducer, initiateActions, finishActions ) => {
	initiateActions.forEach( ( action ) => {
		it( action + ' should set ' + stateKey + ' to true', () => {
			const state = reducer( { [ stateKey ]: false }, {
				type: action,
			} );

			assert.isTrue( state[ stateKey ] );
		} );
	} );

	finishActions.forEach( ( action ) => {
		it( action + ' should set ' + stateKey + ' to false', () => {
			const state = reducer( { [ stateKey ]: true }, {
				type: action,
			} );

			assert.isFalse( state[ stateKey ] );
		} );
	} );
};
