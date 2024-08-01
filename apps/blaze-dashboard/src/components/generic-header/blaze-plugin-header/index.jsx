import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const WooBlazeHeader = ( { className = '', children } ) => {
	const translate = useTranslate();
	const isWooBlaze = config.isEnabled( 'is_running_in_woo_site' );

	return (
		<header className={ clsx( 'blaze-plugin-header', className ) }>
			<h2>{ isWooBlaze ? translate( 'Blaze for WooCommerce' ) : translate( 'Advertising' ) }</h2>
			{ children }
		</header>
	);
};

export default WooBlazeHeader;
