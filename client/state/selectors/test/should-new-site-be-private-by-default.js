/**
 * Internal dependencies
 */
import { shouldNewSiteBePrivateByDefault } from '../should-new-site-be-private-by-default';

jest.mock( 'lib/abtest', () => ( {
	abtest: testName => ( testName === 'privateByDefault' ? 'selected' : '' ),
} ) );

describe( 'shouldNewSiteBePrivateByDefault()', () => {
	test( 'should be true with no input', () => {
		expect( shouldNewSiteBePrivateByDefault() ).toBe( true );
	} );

	test( 'should return `true` if on test-fse flow', () => {
		const mockState = { signup: { flow: { currentFlowName: 'test-fse' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState, 'someOtherSiteType' ) ).toBe( true );
	} );

	test( 'should return `true` for invalid siteType', () => {
		expect( shouldNewSiteBePrivateByDefault( {}, 'someOtherSiteType' ) ).toBe( true );
	} );

	test( 'should return `true` for business segment', () => {
		expect( shouldNewSiteBePrivateByDefault( {}, 'business' ) ).toBe( true );
	} );

	test( 'should return `true` for blog segment', () => {
		expect( shouldNewSiteBePrivateByDefault( {}, 'blog' ) ).toBe( true );
	} );

	test( 'should return `false` for online-store segment', () => {
		expect( shouldNewSiteBePrivateByDefault( {}, 'online-store' ) ).toBe( false );
	} );

	test( 'should return `true` for professional segment', () => {
		expect( shouldNewSiteBePrivateByDefault( {}, 'professional' ) ).toBe( true );
	} );
} );
