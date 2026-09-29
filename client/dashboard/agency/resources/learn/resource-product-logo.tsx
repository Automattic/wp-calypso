import a4aLogo from 'calypso/assets/images/a8c-for-agencies/a4a-full-logo.svg';
import jetpackLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/jetpack.svg';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/pressable.svg';
import vipLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/vip.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/woo.svg';
import wordpressOrgLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/wordpress-org.svg';
import wpcomLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/wpcom.svg';
import { getProductLabel } from './labels';
import type { CSSProperties } from 'react';

const LOGOS: Record< string, { src: string; inlineSize: number } > = {
	'automattic-for-agencies': { src: a4aLogo, inlineSize: 100 },
	jetpack: { src: jetpackLogo, inlineSize: 72 },
	pressable: { src: pressableLogo, inlineSize: 88 },
	woocommerce: { src: wooLogo, inlineSize: 52 },
	'wordpress-com': { src: wpcomLogo, inlineSize: 112 },
	'wordpress-org': { src: wordpressOrgLogo, inlineSize: 98 },
	'wordpress-vip': { src: vipLogo, inlineSize: 48 },
};

/**
 * The wordmark is used as a mask, so it takes the header's text color rather
 * than the brand colors baked into the SVG.
 */
export default function ResourceProductLogo( { product }: { product: string } ) {
	const logo = LOGOS[ product ];

	if ( ! logo ) {
		return null;
	}

	return (
		<span
			className="dashboard-resources-learn__product-logo"
			role="img"
			aria-label={ getProductLabel( product ) }
			style={
				{
					'--resource-logo-image': `url("${ logo.src }")`,
					'--resource-logo-width': `${ logo.inlineSize }px`,
				} as CSSProperties
			}
		/>
	);
}
