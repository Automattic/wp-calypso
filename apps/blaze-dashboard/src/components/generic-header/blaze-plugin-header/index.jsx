import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const BlazePluginHeader = ( { className = '', subHeaderText, children } ) => {
	const translate = useTranslate();
	const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );

	return (
		<header className={ clsx( 'blaze-plugin-header', className ) }>
			<div>
				<h1 className="formatted-header__title wp-brand-font">
					{ isBlazePlugin ? translate( 'Blaze Ads' ) : translate( 'Advertising' ) }
				</h1>
				{ subHeaderText && (
					<p className="formatted-header__subtitle blaze-plugin-header__subtitle">
						{ subHeaderText }
					</p>
				) }
			</div>
			{ children }
		</header>
	);
};

export default BlazePluginHeader;
