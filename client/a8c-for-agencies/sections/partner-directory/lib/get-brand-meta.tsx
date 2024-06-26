import { WooLogo, WordPressLogo, JetpackLogo } from '@automattic/components';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';

export const getBrandMeta = ( brand: string ) => {
	let className = '';
	let icon = undefined;
	let url = '';

	switch ( brand ) {
		case 'WordPress':
		case 'WordPress VIP':
			icon = <WordPressLogo />;
			url = 'https://wordpress.com/';
			break;
		case 'WooCommerce.com':
			icon = <WooLogo />;
			className = 'partner-directory-dashboard__woo-icon';
			url = 'https://woocommerce.com/';
			break;
		case 'Pressable':
			icon = <img src={ pressableIcon } alt="" />;
			url = 'https://pressable.com/';
			break;
		case 'Jetpack':
			icon = <JetpackLogo />;
			url = 'https://jetpack.com/';
			break;
		default:
			icon = undefined;
			break;
	}
	return { className, icon, url };
};
