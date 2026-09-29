import { PRODUCT_ICONS } from './images/icons';
import { getJetpackProductIcon } from './images/jetpack-icons';
import moreGlyph from './images/more.svg';
import type { CSSProperties } from 'react';

/**
 * A product card's tile: the product's own icon, the way stores show each
 * product (A4AD-237). WooCommerce extensions use their WooCommerce.com
 * marketplace icon, Jetpack products Jetpack's product glyph on the Jetpack
 * colour, and anything else the "more" glyph on the neutral tile.
 */
export default function ProductTile( { slug }: { slug: string } ) {
	const icon = PRODUCT_ICONS[ slug ];
	if ( icon ) {
		return <img className="dashboard-marketplace-products__product-icon" src={ icon } alt="" />;
	}
	const jetpackIcon = getJetpackProductIcon( slug );
	return (
		<span
			className="dashboard-body-card__tile"
			data-accent={ jetpackIcon ? 'jetpack' : 'neutral' }
			aria-hidden="true"
		>
			<span
				className="dashboard-marketplace-products__product-glyph"
				style={ { '--product-glyph': `url(${ jetpackIcon ?? moreGlyph })` } as CSSProperties }
			/>
		</span>
	);
}
