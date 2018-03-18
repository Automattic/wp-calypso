/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { localizedSupport } from '../reducer';
import {
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT,
} from 'state/action-types';

describe( 'reducers', () => {
	describe( '#localizedSupport', () => {
		test( 'defaults to false', () => {
			const result = localizedSupport( undefined, {} );
			expect( result ).to.equal( false );
		} );

		test( 'should update on HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT', () => {
			const action = { type: HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT, isAvailable: true };
			const result = localizedSupport( false, action );
			expect( result ).to.equal( action.isAvailable );
		} );

		test( 'should not update on other actions', () => {
			const action = { type: HAPPYCHAT_IO_RECEIVE_INIT, isAvailable: true };
			const result = localizedSupport( false, action );
			expect( result ).to.equal( false );
		} );
	} );
} );
