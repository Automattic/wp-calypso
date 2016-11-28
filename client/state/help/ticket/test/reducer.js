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
} from 'state/action-types';

describe( 'ticket-support/configuration reducer', () => {
	it( 'should default to the expected structure', () => {
		const defaultState = reducer( undefined, {} );

		assert.deepEqual( defaultState, {
			isReady: false,
			isRequesting: false,
			isUserEligible: false,
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

	it( 'should also set isReady as true on failed requests.', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
		} );

		assert.isTrue( state.isReady );
		assert.isFalse( state.isRequesting );
	} );
} );
