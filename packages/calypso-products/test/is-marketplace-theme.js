import { MARKETPLACE_THEME_TSUBAKI_TEST_YEARLY_SLUG } from '../src/constants';
import { isMarketplaceTheme } from '../src/is-marketplace-theme';

describe( 'isMarketplaceTheme', () => {
	it( 'should return true for an existing marketplace theme', () => {
		expect(
			isMarketplaceTheme( { product_slug: MARKETPLACE_THEME_TSUBAKI_TEST_YEARLY_SLUG } )
		).toEqual( true );
	} );
	it( 'should return false for made up marketplace theme', () => {
		expect(
			isMarketplaceTheme( { product_slug: 'wp_mp_theme_made_up_theme_test_yearly' } )
		).toEqual( false );
	} );
} );
