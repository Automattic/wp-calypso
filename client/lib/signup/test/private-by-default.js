/**
 * Internal dependencies
 */
import { getNewSitePublicSetting, shouldBePrivateByDefault } from '../private-by-default';

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );
} );

describe( 'shouldBePrivateByDefault()', () => {
	test( 'should return `true` by default', () => {
		expect( shouldBePrivateByDefault() ).toBeTrue;
	} );
} );
