/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { dummyConfiguration, dummyError } from './test-data';
import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
	HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
} from 'calypso/state/action-types';

describe( 'ticket-support/configuration reducer', () => {
	test( 'should default to the expected structure', () => {
		const defaultState = reducer( undefined, {} );

		assert.deepEqual( defaultState, {
			isReady: false,
			isRequesting: false,
			isUserEligible: false,
			requestError: null,
		} );
	} );

	test( 'should set isRequesting to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		assert.isTrue( state.isRequesting );
	} );

	test( 'should set isUserEligible as is and isReady to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			configuration: dummyConfiguration,
		} );

		assert.isTrue( state.isReady );
		assert.equal( state.isUserEligible, dummyConfiguration.is_user_eligible );
		assert.isFalse( state.isRequesting );
	} );

	test( 'should leave isReady as it is and requestError as the error on failed requests', () => {
		const state = reducer(
			{ isReady: false },
			{
				type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
				error: dummyError,
			}
		);

		assert.isFalse( state.isReady );
		assert.isFalse( state.isRequesting );
		assert.deepEqual( state.requestError, dummyError );
	} );

	const requestErrorState = { requestError: dummyError };

	test( 'should clear reqeustError on receiving the dismiss action', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
		} );

		assert.isNull( state.requestError );
	} );

	test( 'should set requestError as false on receiving the new request', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		assert.isNull( state.requestError );
	} );

	test( 'should set requestError as false on receiving the successful action', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			configuration: dummyConfiguration,
		} );

		assert.isNull( state.requestError );
	} );
} );
