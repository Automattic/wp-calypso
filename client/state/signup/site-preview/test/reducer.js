/** @format */

/**
 * External dependencies
 */
import { isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_SITE_PREVIEW_SHOW } from 'state/action-types';

describe( 'signup site-preview reducer', () => {
	test( 'should return default state', () => {
		expect( reducer( undefined, {} ) ).toEqual( { lastShown: null } );
	} );

	test( 'should update the lastShown value', () => {
		const now = new Date().getTime();
		const newState = reducer( undefined, {
			type: SIGNUP_SITE_PREVIEW_SHOW,
		} );
		const { lastShown } = newState;
		expect( isInteger( lastShown ) ).toBe( true );
		expect( lastShown >= now ).toBe( true );
	} );
} );
