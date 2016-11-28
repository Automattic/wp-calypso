/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { dummyConfiguration } from './test-data';

import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
	HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
} from 'state/action-types';

describe( 'ticket-support/configuration reducer', () => {
	it( 'should default to the expected structure', () => {
		const defaultState = reducer( undefined, {} );

		assert.deepEqual( defaultState, {
			isReady: false,
			isRequesting: false,
			isUserEligible: false,
			requestError: false,
		} );
	} );

	it( 'should set isRequesting to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		assert.isTrue( state.isRequesting );
	} );

	it( 'should set isUserEligible as is and isReady to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			...dummyConfiguration,
		} );

		assert.isTrue( state.isReady );
		assert.equal( state.isUserEligible, dummyConfiguration.is_user_eligible );
		assert.isFalse( state.isRequesting );
	} );

	it( 'should also set isReady as true and requestError as true on failed requests', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
		} );

		assert.isTrue( state.isReady );
		assert.isFalse( state.isRequesting );
		assert.isTrue( state.requestError );
	} );

	const requestErrorState = { requestError: true };

	it( 'should set requestError as false on receiving the dismiss action', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
		} );

		assert.isFalse( state.requestError );
	} );

	it( 'should set requestError as false on receiving the new request', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		assert.isFalse( state.requestError );
	} );

	it( 'should set requestError as false on receiving the successful action', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			...dummyConfiguration,
		} );

		assert.isFalse( state.requestError );
	} );
} );
