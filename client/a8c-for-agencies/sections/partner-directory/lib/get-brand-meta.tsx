import { WooLogo, WordPressLogo, JetpackLogo } from '@automattic/components';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

export type BrandMeta = {
	brand: string;
	icon: JSX.Element | undefined;
	url: string;
	urlProfile: string;
	isAvailable: boolean;
	className?: string;
};

export const getBrandMeta = ( brand: string, agency?: Agency | null ): BrandMeta => {
	const agencySlug =
		agency?.name
			.toLowerCase()
			.replace( /[^a-z0-9\s]/g, '' )
			.replace( /\s+/g, '-' )
			.replace( /^-+|-+$/g, '' ) ?? '-';
	const agencyId = agency?.id ?? '';

	switch ( brand ) {
		case 'WordPress.com':
			return {
				brand: brand,
				icon: <WordPressLogo />,
				url: 'https://wordpress.com/development-services/',
				urlProfile: `https://wordpress.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: false,
			};

		case 'WooCommerce.com':
			return {
				brand: brand,
				icon: <WooLogo />,
				className: 'partner-directory-dashboard__woo-icon',
				url: 'https://woocommerce.com/development-services/',
				urlProfile: `https://woocommerce.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: false,
			};
		case 'Pressable.com':
			return {
				brand: brand,
				icon: <img src={ pressableIcon } alt="" />,
				url: 'https://pressable.com/development-services/',
				urlProfile: `https://pressable.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: false,
			};
		case 'Jetpack.com':
			return {
				brand: brand,
				icon: <JetpackLogo />,
				url: 'https://jetpack.com/development-services/',
				urlProfile: `https://jetpack.com/development-services/${ agencySlug }/${ agencyId }`,
				isAvailable: false,
			};
		default:
			return {
				brand: 'Unknown',
				icon: undefined,
				url: '',
				urlProfile: '',
				isAvailable: false,
			};
	}
};
