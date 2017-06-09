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
	REWIND_DEACTIVATE_FAILURE,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
} from 'state/action-types';

/**
 * Constants
 */
const SITE_ID = 123456;
const OTHER_SITE_ID = 987654;

describe( '#activationRequesting()', () => {
	it( 'should be true on activation request', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_REQUEST ) );
		expect( state[ SITE_ID ] ).to.be.true;
	} );

	it( 'should be false on activation success', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_SUCCESS ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	it( 'should be false on activation failure', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_ACTIVATE_FAILURE ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	it( 'should be true on deactivation request', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_DEACTIVATE_REQUEST ) );
		expect( state[ SITE_ID ] ).to.be.true;
	} );

	it( 'should be false on deactivation success', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_DEACTIVATE_SUCCESS ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	it( 'should be false on deactivation failure', () => {
		const state = activationRequesting( undefined, createSiteAction( REWIND_DEACTIVATE_FAILURE ) );
		expect( state[ SITE_ID ] ).to.be.false;
	} );

	it( 'should preserve other sites', () => {
		const prevState = deepFreeze( {
			[ OTHER_SITE_ID ]: false
		} );

		let state = prevState;
		[
			REWIND_ACTIVATE_REQUEST,
			REWIND_ACTIVATE_FAILURE,
			REWIND_ACTIVATE_REQUEST,
			REWIND_ACTIVATE_SUCCESS,
			REWIND_DEACTIVATE_REQUEST,
			REWIND_DEACTIVATE_FAILURE,
			REWIND_DEACTIVATE_REQUEST,
			REWIND_DEACTIVATE_SUCCESS,
		].forEach( type => {
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
