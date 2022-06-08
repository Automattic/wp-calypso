import { Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import WordPressLogo from 'calypso/components/wordpress-logo';

import './partner-signup.scss';

export default function PartnerSignupMasterbar() {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();
	return (
		<header className="masterbar__partner-signup">
			<nav className="masterbar__partner-signup-nav-wrapper">
				<WordPressLogo className="masterbar__partner-signup-logo" size={ 120 } />
				<a
					className="masterbar__partner-signup-back-link"
					href={ localizeUrl( 'https://wordpress.com/partners/' ) }
				>
					{ createInterpolateElement( __( '<left_arrow/> Go back' ), {
						left_arrow: <Gridicon icon="chevron-left" />,
					} ) }
				</a>
			</nav>
		</header>
	);
}
