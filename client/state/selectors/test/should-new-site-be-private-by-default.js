/**
 * Internal dependencies
 */
import shouldNewSiteBePrivateByDefault from '../should-new-site-be-private-by-default';

describe( 'shouldNewSiteBePrivateByDefault()', () => {
	test( 'should be true with no input', () => {
		expect( shouldNewSiteBePrivateByDefault() ).toBe( true );
	} );

	test( 'should return `true` for invalid siteType', () => {
		const mockState = { signup: { steps: { siteType: 'someOtherSiteType' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `true` for business segment', () => {
		const mockState = { signup: { steps: { siteType: 'business' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `true` for blog segment', () => {
		const mockState = { signup: { steps: { siteType: 'blog' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `false` for online-store segment', () => {
		const mockState = { signup: { steps: { siteType: 'online-store' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( false );
	} );

	test( 'should return `true` for professional segment', () => {
		const mockState = { signup: { steps: { siteType: 'professional' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );
} );
