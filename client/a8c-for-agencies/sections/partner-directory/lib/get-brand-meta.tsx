import { WooLogo, WordPressLogo, JetpackLogo } from '@automattic/components';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

export const getBrandMeta = ( brand: string, agency?: Agency | null ) => {
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
				icon: <WordPressLogo />,
				url: 'https://wordpress.com/development-services/',
				urlProfile: `https://wordpress.com/development-services/${ agencySlug }/${ agencyId }`,
				isPublic: true,
			};

		case 'WooCommerce.com':
			return {
				icon: <WooLogo />,
				className: 'partner-directory-dashboard__woo-icon',
				url: 'https://woocommerce.com/development-services/',
				urlProfile: `https://woocommerce.com/development-services/${ agencySlug }/${ agencyId }`,
				isPublic: false,
			};
		case 'Pressable.com':
			return {
				icon: <img src={ pressableIcon } alt="" />,
				url: 'https://pressable.com/development-services/',
				urlProfile: `https://pressable.com/development-services/${ agencySlug }/${ agencyId }`,
				isPublic: false,
			};
		case 'Jetpack.com':
			return {
				icon: <JetpackLogo />,
				url: 'https://jetpack.com/development-services/',
				urlProfile: `https://jetpack.com/development-services/${ agencySlug }/${ agencyId }`,
				isPublic: true,
			};
		default:
			return {
				icon: undefined,
				url: '',
				urlProfile: '',
				isPublic: false,
			};
	}
};
