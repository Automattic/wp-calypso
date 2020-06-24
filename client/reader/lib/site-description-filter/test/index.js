/**
 * Internal dependencies
 */
import { isSiteDescriptionDisallowed } from '../';

describe( 'isSiteDescriptionDisallowed', () => {
	test( 'should return true if a site description is disallowed', () => {
		const disallowedDescription = 'Just another WordPress site';
		expect( isSiteDescriptionDisallowed( disallowedDescription ) ).toBeTrue();
	} );

	test( 'should return false if a site description is allowed', () => {
		const allowedDescription = 'My site is marvellous';
		expect( isSiteDescriptionDisallowed( allowedDescription ) ).toBeFalse();
	} );
} );
