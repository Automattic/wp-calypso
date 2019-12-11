/**
 * Internal dependencies
 */
import { isSiteDescriptionBlocklisted } from '../';

describe( 'isSiteDescriptionBlocklisted', () => {
	test( 'should return true if a site description is blocklisted', () => {
		const blockListedDescription = 'Just another WordPress site';
		expect( isSiteDescriptionBlocklisted( blockListedDescription ) ).toBeTrue;
	} );

	test( 'should return false if a site description is not blocklisted', () => {
		const unBlockListedDescription = 'My site is marvellous';
		expect( isSiteDescriptionBlocklisted( unBlockListedDescription ) ).toBeFalse;
	} );
} );
