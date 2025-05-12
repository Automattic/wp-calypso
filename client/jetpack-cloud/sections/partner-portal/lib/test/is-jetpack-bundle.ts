// @ts-nocheck - TODO: Fix TypeScript issues
import isJetpackBundle from '../is-jetpack-bundle';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

const createFakeApiProduct = ( slug: string, family_slug: string ): APIProductFamilyProduct => ( {
	name: '',
	slug,
	product_id: 0,
	currency: '',
	amount: 0,
	price_interval: '',
	family_slug,
} );

describe( 'isJetpackBundle', () => {
	describe( 'string argument', () => {
		it.each( [
			[ 'jetpack-complete' ],
			[ 'jetpack-security-t1' ],
			[ 'jetpack-security-t2' ],
			[ 'jetpack-starter' ],
		] )( 'returns true if value matches a bundle product slug', ( input ) => {
			expect( isJetpackBundle( input ) ).toBe( true );
		} );

		it.each( [
			[ 'jetpack-backup-t1' ],
			[ 'a-random-string' ],
			[ 'jetpack-social-advanced' ],
			[ 'wpcom-business' ],
			[ 'jetpack-complet' ],
		] )( 'returns false if value does not match any bundle product slug', ( input ) => {
			expect( isJetpackBundle( input ) ).toBe( false );
		} );
	} );

	describe( 'APIProductFamilyProduct argument', () => {
		it.each( [
			[ createFakeApiProduct( 'jetpack-complete', 'jetpack-packs' ) ],
			[ createFakeApiProduct( 'literally-any-other-slug', 'jetpack-packs' ) ],
		] )( 'returns true if `family_slug` property is jetpack-packs', ( input ) => {
			expect( isJetpackBundle( input ) ).toBe( true );
		} );

		it.each( [
			[ createFakeApiProduct( 'jetpack-complete', 'literally-any-other-family-slug' ) ],
			[ createFakeApiProduct( 'literally-any-other-slug', 'literally-any-other-family-slug' ) ],
		] )( 'returns false if `family_slug` property is not jetpack-packs', ( input ) => {
			expect( isJetpackBundle( input ) ).toBe( false );
		} );
	} );
} );
