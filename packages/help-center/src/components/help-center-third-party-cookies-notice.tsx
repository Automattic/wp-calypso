import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

import './help-center-third-party-cookies-notice.scss';

const ThirdPartyCookiesNotice: React.FC = () => {
	const { __ } = useI18n();
	const { sectionName } = useHelpCenterContext();

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_third_party_cookies_notice_open', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	}, [] ); // Dependencies do not include sectionName on purpose - we just care about reporting it once

	return (
		<div className="help-center-third-party-cookies-notice">
			<div className="help-center-third-party-cookies-notice__content">
				<h1>{ __( 'Action needed', __i18n_text_domain__ ) }</h1>
				<p>
					{ __(
						'In order to access the live chat widget, you will need to enable third-party cookies for WordPress.com.',
						__i18n_text_domain__
					) }
					&nbsp;
					<a
						target="_blank"
						rel="noopener noreferrer"
						href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) }
					>
						{ __( 'Learn more in this support guide.', __i18n_text_domain__ ) }
					</a>
				</p>
			</div>
		</div>
	);
};

export default ThirdPartyCookiesNotice;
