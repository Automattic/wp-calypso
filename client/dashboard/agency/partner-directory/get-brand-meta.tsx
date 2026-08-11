import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WooCommerceWooLogo } from '@automattic/components/src/logos/woocommerce-woo-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import type { AgencyPartnerDirectorySlug } from '@automattic/api-core';
import type { ReactNode } from 'react';

export type BrandMeta = {
	icon: ReactNode;
	url: string;
	profileUrl: string;
	isAvailable: boolean;
};

/**
 * Returns the public directory URLs and icon for a partner directory brand.
 */
export function getBrandMeta(
	directory: AgencyPartnerDirectorySlug,
	agency?: { id: number; name: string } | null
): BrandMeta {
	const agencySlug =
		agency?.name
			.toLowerCase()
			.replace( /[^a-z0-9\s]/g, '' )
			.replace( /\s+/g, '-' )
			.replace( /^-+|-+$/g, '' ) ?? '-';
	const agencyId = agency?.id ?? '';

	switch ( directory ) {
		case 'wordpress':
			return {
				icon: <WordPressLogo size={ 24 } />,
				url: 'https://wordpress.com/development-services/',
				profileUrl: `https://wordpress.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: true,
			};
		case 'woocommerce':
			return {
				icon: <WooCommerceWooLogo width={ 36 } height={ 24 } />,
				url: 'https://woocommerce.com/development-services/',
				profileUrl: `https://woocommerce.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: true,
			};
		case 'pressable':
			return {
				icon: <img src={ pressableIcon } alt="" width={ 24 } />,
				url: 'https://pressable.com/development-services/',
				profileUrl: `https://pressable.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: true,
			};
		case 'jetpack':
			return {
				icon: <JetpackLogo size={ 24 } />,
				url: 'https://jetpack.com/development-services/',
				profileUrl: `https://jetpack.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: true,
			};
		default:
			return {
				icon: undefined,
				url: '',
				profileUrl: '',
				isAvailable: false,
			};
	}
}
