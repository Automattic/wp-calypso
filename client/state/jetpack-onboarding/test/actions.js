/** @format */

/**
 * Internal dependencies
 */
import { setSiteDescription, setSiteTitle } from '../actions';
import {
	JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
	JETPACK_ONBOARDING_SITE_TITLE_SET,
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'setSiteTitle()', () => {
		test( 'should return a site title set action object', () => {
			const siteTitle = 'My Awesome Site';
			const action = setSiteTitle( siteTitle );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_SITE_TITLE_SET,
				siteTitle,
			} );
		} );
	} );

	describe( 'setSiteDescription()', () => {
		test( 'should return a site description set action object', () => {
			const siteDescription = 'Not just another WordPress site';
			const action = setSiteDescription( siteDescription );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
				siteDescription,
			} );
		} );
	} );
} );
