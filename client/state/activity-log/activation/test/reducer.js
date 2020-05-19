/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { activationRequesting } from '../reducer';
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
} from 'state/action-types';

/**
 * Constants
 */
const SITE_ID = 123456;
const OTHER_SITE_ID = 987654;

describe( '#activationRequesting()', () => {
	test( 'should be true on request', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_REQUEST ) );
		expect( state[ SITE_ID ] ).to.be.true;
	} );

	test( 'should be false on success', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_SUCCESS ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	test( 'should be false on failure', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_FAILURE ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	test( 'should preserve other sites', () => {
		const prevState = deepFreeze( {
			[ OTHER_SITE_ID ]: false,
		} );

		let state = prevState;
		[
			REWIND_ACTIVATE_REQUEST,
			REWIND_ACTIVATE_FAILURE,
			REWIND_ACTIVATE_REQUEST,
			REWIND_ACTIVATE_SUCCESS,
		].forEach( ( type ) => {
			state = activationRequesting( state, createSiteAction( type ) );
			expect( state[ OTHER_SITE_ID ] ).to.be.false;
		} );
	} );
} );

function createSiteAction( type ) {
	return {
		type,
		siteId: SITE_ID,
	};
}
