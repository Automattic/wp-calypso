import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useChatStatus } from '../hooks';
import './notices.scss';

export const NewThirdPartyCookiesNotice: React.FC = () => {
	const { sectionName, canConnectToZendesk } = useHelpCenterContext();
	const { isEligibleForChat } = useChatStatus();

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_third_party_cookies_notice_open', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	}, [ sectionName ] );

	if ( canConnectToZendesk || ! isEligibleForChat ) {
		return null;
	}

	return (
		<div className="help-center__notice cookie-warning">
			<p>
				<strong>{ __( 'Enable cookies to get support.', __i18n_text_domain__ ) }</strong>
				&nbsp;
				{ __(
					'To access support, please turn on third-party cookies for WordPress.com.',
					__i18n_text_domain__
				) }
				&nbsp;
				<a
					target="_blank"
					rel="noopener noreferrer"
					href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) }
				>
					{ __( 'Learn more.', __i18n_text_domain__ ) }
				</a>
			</p>
		</div>
	);
};

export const EmailFallbackNotice: React.FC = () => {
	const navigate = useNavigate();
	return (
		<div className="help-center__notice">
			<p>
				<strong>
					{ __(
						'Live chat is temporarily unavailable for scheduled maintenance.',
						__i18n_text_domain__
					) }
				</strong>
				&nbsp;
				{ createInterpolateElement(
					__(
						'We’re sorry for the inconvenience and appreciate your patience. Please feel free to reach out via <email>email</email> or check our <guides>Support Guides</guides> in the meantime.',
						__i18n_text_domain__
					),
					{
						email: (
							<Button
								variant="link"
								className="help-center__notice-link"
								onClick={ () => navigate( '/contact-form?mode=EMAIL&wapuuFlow=true' ) }
							/>
						),
						guides: (
							<Button
								variant="link"
								className="help-center__notice-link"
								onClick={ () => navigate( '/' ) }
							/>
						),
					}
				) }
			</p>
		</div>
	);
};
