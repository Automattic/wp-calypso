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
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
} from 'state/action-types';

describe( 'ticket-support/configuration reducer', () => {
	describe( '#TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS', () => {
		it( 'should default to null', () => {
			const defaultState = reducer( undefined, {} );

			assert.isNull( defaultState );
		} );

		it( 'should set isUserEligible property', () => {
			const state = reducer( undefined, {
				type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
				...dummyConfiguration,
			} );

			assert.deepEqual( state, {
				isUserEligible: dummyConfiguration.is_user_eligible,
			} );
		} );
	} );
} );
