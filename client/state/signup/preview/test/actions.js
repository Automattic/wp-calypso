/**
 * Internal dependencies
 */
import { SIGNUP_SITE_PREVIEW_SHOW, SIGNUP_SITE_PREVIEW_HIDE } from 'calypso/state/action-types';
import { showSitePreview, hideSitePreview } from '../actions';

describe( 'state/signup/preview/actions', () => {
	test( 'showSitePreview()', () => {
		expect( showSitePreview() ).toEqual( {
			type: SIGNUP_SITE_PREVIEW_SHOW,
		} );
	} );

	test( 'hideSitePreview()', () => {
		expect( hideSitePreview() ).toEqual( {
			type: SIGNUP_SITE_PREVIEW_HIDE,
		} );
	} );
} );
