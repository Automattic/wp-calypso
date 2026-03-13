import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const WooBlazeHeader = ( { className = '', children } ) => {
	const translate = useTranslate();

	return (
		<header className={ clsx( 'blaze-plugin-header', className ) }>
			<h1 className="formatted-header__title wp-brand-font">{ translate( 'Blaze Ads' ) }</h1>
			{ children }
		</header>
	);
};

export default WooBlazeHeader;
