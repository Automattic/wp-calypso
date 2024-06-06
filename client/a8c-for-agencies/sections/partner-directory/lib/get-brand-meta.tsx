import { WooLogo, WordPressLogo, JetpackLogo } from '@automattic/components';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';

export const getBrandMeta = ( brand: string ) => {
	let className = '';
	let icon = undefined;
	switch ( brand ) {
		case 'WordPress.com':
			icon = <WordPressLogo />;
			break;
		case 'WooCommerce.com':
			icon = <WooLogo />;
			className = 'partner-directory-dashboard__woo-icon';
			break;
		case 'Pressable.com':
			icon = <img src={ pressableIcon } alt="" />;
			break;
		case 'Jetpack.com':
			icon = <JetpackLogo />;
			break;
		default:
			icon = undefined;
			break;
	}
	return { className, icon };
};
