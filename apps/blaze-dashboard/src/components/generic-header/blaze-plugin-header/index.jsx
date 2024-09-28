import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const WooBlazeHeader = ( { className = '', children } ) => {
	const translate = useTranslate();
	const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );

	return (
		<header className={ clsx( 'blaze-plugin-header', className ) }>
			<h2>{ isBlazePlugin ? translate( 'Blaze Ads' ) : translate( 'Advertising' ) }</h2>
			{ children }
		</header>
	);
};

export default WooBlazeHeader;
