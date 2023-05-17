/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { BackButton } from './back-button';

const ThirdPartyCookiesNotice: React.FC = () => {
	const { __ } = useI18n();
	const sectionName = useSelector( getSectionName );

	useEffect( () =>
		recordTracksEvent( 'calypso_helpcenter_third_party_cookies_notice_open', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} )
	);

	return (
		<div className="help-center-third-party-cookies-notice">
			<BackButton />
			<div>
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
						href="https://wordpress.com/support/third-party-cookies/"
					>
						{ __( 'Learn more in this support guide.', __i18n_text_domain__ ) }
					</a>
				</p>
			</div>
		</div>
	);
};

export default ThirdPartyCookiesNotice;
