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
	postConditionFailed,
} ) => {
	const { method, endpoint, successResponse, errorResponse } = nockSettings;

	const apiUrl = 'https://public-api.wordpress.com:443';

	describe( testBaseName + ' success', () => {
		useNock( ( nock ) => {
			nock( apiUrl )[ method ]( endpoint ).reply( 200, successResponse );
		} );

		test( 'should be successful.', () => {
			const action = thunk();

			preCondition();

			return action.then( postConditionSuccess );
		} );
	} );

	describe( testBaseName + ' fail', () => {
		useNock( ( nock ) => {
			nock( apiUrl )[ method ]( endpoint ).reply( errorResponse.status, errorResponse );
		} );

		test( 'should be failed', () => {
			const action = thunk();

			preCondition();

			return action.then( postConditionFailed );
		} );
	} );
};
