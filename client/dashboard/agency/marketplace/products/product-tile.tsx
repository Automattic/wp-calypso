import clsx from 'clsx';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import moreGlyph from './images/more.svg';
import { getJetpackProductIcon } from './lib/jetpack-icons';
import { isPressableAddon } from './lib/product-categories';
import type { AgencyProduct } from '@automattic/api-core';
import type { CSSProperties } from 'react';

// The catalog icon when there is one, else the Pressable logo, the Jetpack
// glyph or the "more" glyph.
export default function ProductTile( { product }: { product: AgencyProduct } ) {
	const icon = product.icon_url ?? ( isPressableAddon( product ) ? pressableIcon : undefined );
	if ( icon ) {
		return (
			<img
				className={ clsx( 'dashboard-marketplace-products__product-icon', {
					'is-logo': ! product.icon_url,
				} ) }
				src={ icon }
				alt=""
				loading="lazy"
				decoding="async"
			/>
		);
	}
	const jetpackIcon = getJetpackProductIcon( product.slug );
	return (
		<span
			className="dashboard-body-card__tile"
			data-accent={ jetpackIcon ? 'jetpack' : 'neutral' }
			aria-hidden="true"
		>
			<span
				className={ clsx( 'dashboard-marketplace-products__product-glyph', {
					'is-more': ! jetpackIcon,
				} ) }
				style={ { '--product-glyph': `url(${ jetpackIcon ?? moreGlyph })` } as CSSProperties }
			/>
		</span>
	);
}
