import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const WooBlazeHeader = ( { className = '', children } ) => {
	const translate = useTranslate();

	return (
		<header className={ clsx( 'woo-blaze-header', className ) }>
			<h2>{ translate( 'Blaze for WooCommerce' ) }</h2>
			{ children }
		</header>
	);
};

export default WooBlazeHeader;
