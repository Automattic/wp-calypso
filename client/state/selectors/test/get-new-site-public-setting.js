/**
 * Internal dependencies
 */
import { getNewSitePublicSetting } from '../get-new-site-public-setting';

jest.mock( 'lib/abtest', () => ( {
	abtest: testName => ( testName === 'privateByDefault' ? 'selected' : '' ),
} ) );

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );

	test( 'should return `-1` if on test-fse flow', () => {
		const mockState = { signup: { flow: { currentFlowName: 'test-fse' } } };
		expect( getNewSitePublicSetting( mockState, 'someOtherSiteType' ) ).toBe( -1 );
	} );

	test( 'should return `-1` for invalid siteType', () => {
		expect( getNewSitePublicSetting( {}, 'someOtherSiteType' ) ).toBe( -1 );
	} );

	test( 'should return `-1` for business segment', () => {
		expect( getNewSitePublicSetting( {}, 'business' ) ).toBe( -1 );
	} );

	test( 'should return `-1` for blog segment', () => {
		expect( getNewSitePublicSetting( {}, 'blog' ) ).toBe( -1 );
	} );

	test( 'should return `1` for online-store segment', () => {
		expect( getNewSitePublicSetting( {}, 'online-store' ) ).toBe( 1 );
	} );

	test( 'should return `-1` for professional segment', () => {
		expect( getNewSitePublicSetting( {}, 'professional' ) ).toBe( -1 );
	} );
} );
