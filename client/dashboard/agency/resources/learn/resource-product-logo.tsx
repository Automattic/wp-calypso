import a4aLogo from 'calypso/assets/images/a8c-for-agencies/a4a-full-logo.svg';
import jetpackLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/jetpack.svg';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/pressable.svg';
import vipLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/vip.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/woo.svg';
import wpcomLogo from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/wpcom.svg';
import type { CSSProperties } from 'react';

const logos: Record< string, { src: string; inlineSize: number } > = {
	'WordPress VIP': { src: vipLogo, inlineSize: 48 },
	Pressable: { src: pressableLogo, inlineSize: 88 },
	WooCommerce: { src: wooLogo, inlineSize: 52 },
	'WordPress.com': { src: wpcomLogo, inlineSize: 112 },
	Jetpack: { src: jetpackLogo, inlineSize: 72 },
	'Automattic for Agencies': { src: a4aLogo, inlineSize: 100 },
};

export default function ResourceProductLogo( { product }: { product: string } ) {
	const logo = logos[ product ];
	if ( ! logo ) {
		return null;
	}
	return (
		<span
			className="resource-product-logo"
			role="img"
			aria-label={ product }
			style={
				{
					'--resource-logo-image': `url("${ logo.src }")`,
					'--resource-logo-width': `${ logo.inlineSize }px`,
				} as CSSProperties
			}
		/>
	);
}
