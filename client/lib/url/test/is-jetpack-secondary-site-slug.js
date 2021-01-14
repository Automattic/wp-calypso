/**
 * Internal dependencies
 */
import isJetpackSecondarySiteSlug from '../is-jetpack-secondary-site-slug';

describe( 'isJetpackSecondarySiteSlug', () => {
	test( 'should return true if the argument is a secondary site slug', () => {
		expect( isJetpackSecondarySiteSlug( 'example.com::test' ) ).toBe( true );
		expect( isJetpackSecondarySiteSlug( 'past-rat.jurassic.ninja::test' ) ).toBe( true );
	} );

	test( 'should return false otherwise', () => {
		expect( isJetpackSecondarySiteSlug( '' ) ).toBe( false );
		expect( isJetpackSecondarySiteSlug( 'https://past-rat.jurassic.ninja::test' ) ).toBe( false );
		expect( isJetpackSecondarySiteSlug( 'past-rat.jurassic.ninja' ) ).toBe( false );
	} );
} );
