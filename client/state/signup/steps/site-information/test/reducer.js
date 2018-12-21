/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

describe( 'reducer', () => {
	const siteInformationMockData = {
		title: 'Fwwwooorrr!',
		address: '27 Pleasant Crescent',
		phone: '+39 1234 1234',
	};
	test( 'should update the site information', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_INFORMATION_SET,
					data: siteInformationMockData,
				}
			)
		).toEqual( siteInformationMockData );
	} );

	test( 'should assign new values to site information properties and maintain existing values', () => {
		const newSiteInformation = {
			title: 'Yeehah!',
		};
		expect(
			reducer( siteInformationMockData, {
				type: SIGNUP_STEPS_SITE_INFORMATION_SET,
				data: newSiteInformation,
			} )
		).toEqual( {
			...siteInformationMockData,
			...newSiteInformation,
		} );
	} );
} );
