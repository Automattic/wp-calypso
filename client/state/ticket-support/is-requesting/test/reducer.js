/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'ticket-support/is-requesting reducer', () => {
	it( 'TICKET_SUPPORT_CONFIGURATION_REQUEST should resolve to true', () => {
		assert.isTrue( reducer( {}, { type: TICKET_SUPPORT_CONFIGURATION_REQUEST } ) );
	} );
	it( 'TICKET_SUPPORT_CONFIGURATION_SUCCESS should resolve to false', () => {
		assert.isFalse( reducer( {}, { type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS } ) );
	} );
	it( 'TICKET_SUPPORT_CONFIGURATION_FAILURE should resolve to false', () => {
		assert.isFalse( reducer( {}, { type: TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE } ) );
	} );
} );
