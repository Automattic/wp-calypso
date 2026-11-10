import getJetpackProductFeatures from '../get-jetpack-product-features';
import type { useTranslate } from 'i18n-calypso';

const translate = ( ( text: string ) => text ) as ReturnType< typeof useTranslate >;

describe( 'getJetpackProductFeatures', () => {
	it.each( [ 'jetpack_pro_monthly', 'jetpack_pro_yearly', 'jetpack_pro_bi_yearly' ] )(
		'lists the Pro limits for %s',
		( productSlug ) => {
			const features = getJetpackProductFeatures( { product_slug: productSlug }, translate );

			expect( features ).toEqual(
				expect.arrayContaining( [
					'VaultPress Backup (50GB storage)',
					'Stats (Up to 50K site views, upgradeable)',
				] )
			);
			expect( features ).not.toContain( 'Stats (Up to 100K site views, upgradeable)' );
		}
	);

	it( 'keeps the Complete limits for Complete', () => {
		expect(
			getJetpackProductFeatures( { product_slug: 'jetpack_complete' }, translate )
		).toContain( 'Stats (Up to 100K site views, upgradeable)' );
	} );
} );
