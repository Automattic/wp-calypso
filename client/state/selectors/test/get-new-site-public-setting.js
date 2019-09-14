/**
 * Internal dependencies
 */
import getNewSitePublicSetting from '../get-new-site-public-setting';

jest.mock( 'lib/abtest', () => ( {
	abtest: testName => ( testName === 'privateByDefault' ? 'selected' : '' ),
} ) );

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );

	test( 'should return `-1` if on test-fse flow', () => {
		const mockState = {
			signup: { flow: { currentFlowName: 'test-fse' }, steps: { siteType: 'online-store' } },
		};
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `-1` for invalid siteType', () => {
		const mockState = { signup: { steps: { siteType: 'someOtherSiteType' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `-1` for business segment', () => {
		const mockState = { signup: { steps: { siteType: 'business' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `-1` for blog segment', () => {
		const mockState = { signup: { steps: { siteType: 'blog' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `1` for online-store segment', () => {
		const mockState = { signup: { steps: { siteType: 'online-store' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( 1 );
	} );

	test( 'should return `-1` for professional segment', () => {
		const mockState = { signup: { steps: { siteType: 'professional' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );
} );
