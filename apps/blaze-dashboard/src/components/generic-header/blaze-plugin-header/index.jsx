import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import BlazeLogo from 'calypso/components/blaze-logo';

import './style.scss';

const WooBlazeHeader = ( { className = '', children } ) => {
	const translate = useTranslate();

	return (
		<header className={ clsx( 'blaze-plugin-header', className ) }>
			<div className="blaze-plugin-header__title-row">
				<BlazeLogo size={ 28 } />
				<h1 className="formatted-header__title wp-brand-font">{ translate( 'Blaze Ads' ) }</h1>
			</div>
			{ children }
		</header>
	);
};

export default WooBlazeHeader;
