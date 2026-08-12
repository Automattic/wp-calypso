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

const DIRECTORY_BRANDS: Partial<
	Record< AgencyPartnerDirectorySlug, { host: string; icon: ReactNode } >
> = {
	wordpress: { host: 'wordpress.com', icon: <WordPressLogo size={ 24 } /> },
	woocommerce: { host: 'woocommerce.com', icon: <WooCommerceWooLogo width={ 36 } height={ 24 } /> },
	pressable: { host: 'pressable.com', icon: <img src={ pressableIcon } alt="" width={ 24 } /> },
	jetpack: { host: 'jetpack.com', icon: <JetpackLogo size={ 24 } /> },
};

/**
 * Returns the public directory URLs and icon for a partner directory brand.
 */
export function getBrandMeta(
	directory: AgencyPartnerDirectorySlug,
	agency?: { id: number; name: string } | null
): BrandMeta {
	const brand = DIRECTORY_BRANDS[ directory ];
	if ( ! brand ) {
		return {
			icon: undefined,
			url: '',
			profileUrl: '',
			isAvailable: false,
		};
	}

	const agencySlug =
		agency?.name
			.toLowerCase()
			.replace( /[^a-z0-9\s]/g, '' )
			.replace( /\s+/g, '-' )
			.replace( /^-+|-+$/g, '' ) || '-';
	const url = `https://${ brand.host }/development-services/`;

	return {
		icon: brand.icon,
		url,
		profileUrl: `${ url }${ agencySlug }/${ agency?.id ?? '' }`,
		isAvailable: true,
	};
}
