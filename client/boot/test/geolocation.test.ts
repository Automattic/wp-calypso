/**
 * @jest-environment jsdom
 */

import { setGeoLocation } from '@automattic/number-formatters';
import { setupCountryCode } from '../geolocation';

jest.mock( '@automattic/number-formatters', () => ( {
	setGeoLocation: jest.fn(),
} ) );

describe( 'setupCountryCode', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		document.cookie = '';
	} );

	test( 'should use country_code from cookie and set geo location correctly', async () => {
		document.cookie = 'country_code=US';

		await setupCountryCode();

		expect( setGeoLocation ).toHaveBeenCalledWith( 'US' );
	} );

	test( 'should not set location if cookie has unknown country', async () => {
		document.cookie = 'country_code=unknown';

		await setupCountryCode();

		expect( setGeoLocation ).not.toHaveBeenCalled();
	} );

	test( 'should not set location if country_code cookie is not set', async () => {
		document.cookie = '';

		await setupCountryCode();

		expect( setGeoLocation ).not.toHaveBeenCalled();
	} );
} );
