/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_SITE_PREVIEW_SHOW, SIGNUP_SITE_PREVIEW_HIDE } from 'calypso/state/action-types';

describe( 'state/signup/preview/reducer', () => {
	test( 'should default to initialState', () => {
		expect( reducer( undefined, {} ) ).toEqual( {
			isVisible: false,
		} );
	} );

	test( 'should set `isVisible` to `true`', () => {
		expect(
			reducer( undefined, {
				type: SIGNUP_SITE_PREVIEW_SHOW,
			} )
		).toEqual( {
			isVisible: true,
		} );
	} );

	test( 'should set `isVisible` to `false`', () => {
		expect(
			reducer( undefined, {
				type: SIGNUP_SITE_PREVIEW_HIDE,
			} )
		).toEqual( {
			isVisible: false,
		} );
	} );
} );
