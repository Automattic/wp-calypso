import { getTitanProductSlug } from '../get-titan-product-slug';

describe( 'getTitanProductSlug', () => {
	test.each( [
		[ 'pro', 'yearly', 'wp_titan_mail_yearly' ],
		[ 'pro', 'monthly', 'wp_titan_mail_monthly' ],
		[ 'premium', 'yearly', 'wp_titan_mail_premium_yearly' ],
		[ 'premium', 'monthly', 'wp_titan_mail_premium_monthly' ],
		[ 'ultra', 'yearly', 'wp_titan_mail_ultra_yearly' ],
		[ 'ultra', 'monthly', 'wp_titan_mail_ultra_monthly' ],
	] )( 'maps tier=%s billing=%s to %s', ( tier, billing, slug ) => {
		expect( getTitanProductSlug( tier, billing ) ).toBe( slug );
	} );

	test( 'falls back to Essential yearly for missing or unknown values', () => {
		expect( getTitanProductSlug() ).toBe( 'wp_titan_mail_yearly' );
		expect( getTitanProductSlug( 'gold', 'weekly' ) ).toBe( 'wp_titan_mail_yearly' );
		expect( getTitanProductSlug( 'toString', 'monthly' ) ).toBe( 'wp_titan_mail_monthly' );
		expect( getTitanProductSlug( 'ultra' ) ).toBe( 'wp_titan_mail_ultra_yearly' );
	} );
} );
