import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import useChatStatus from '../hooks/use-chat-status';
import './notices.scss';
import { HELP_CENTER_STORE } from '../stores';

export const BlockedZendeskNotice: React.FC = () => {
	const { sectionName } = useHelpCenterContext();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	const { isEligibleForChat } = useChatStatus();
	const { setShowSupportDoc } = useDispatch( HELP_CENTER_STORE );

	const willShowNotice = ! canConnectToZendesk && isEligibleForChat;

	useEffect( () => {
		if ( willShowNotice ) {
			recordTracksEvent( 'calypso_helpcenter_third_party_cookies_notice_open', {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );
		}
	}, [ willShowNotice, sectionName ] );

	if ( ! willShowNotice ) {
		return null;
	}

	return (
		<div className="help-center__notice cookie-warning">
			<p>
				<strong>{ __( 'Live support is unavailable.', __i18n_text_domain__ ) }</strong>
				&nbsp;
				{ __(
					'Your browser settings block our live chat support. This usually happens when an ad blocker or strict tracking protection is enabled.',
					__i18n_text_domain__
				) }
				&nbsp;
				<Button
					variant="link"
					onClick={ () => {
						setShowSupportDoc(
							localizeUrl( 'https://wordpress.com/support/troubleshoot-browser-block-chat/' )
						);
					} }
				>
					{ __( 'Learn more.', __i18n_text_domain__ ) }
				</Button>
			</p>
		</div>
	);
};

export const EmailFallbackNotice: React.FC = () => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const { data: supportStatus } = useSupportStatus();
	const params = new URLSearchParams( search );
	params.set( 'wapuuFlow', 'true' );
	const url = '/contact-form?' + params.toString();

	const title = supportStatus?.eligibility?.is_chat_restricted
		? __( 'Live chat is currently unavailable.', __i18n_text_domain__ )
		: __( 'Live chat is temporarily unavailable for scheduled maintenance.', __i18n_text_domain__ );

	const message = __(
		'Please reach out via <email>email</email> if you need assistance.',
		__i18n_text_domain__
	);

	return (
		<div className="help-center__notice email-fallback-notice">
			<Icon icon={ info } className="help-center__notice-icon" />
			<p>
				<strong>{ title }</strong>
				&nbsp;
				{ createInterpolateElement( message, {
					email: (
						<Button
							variant="link"
							className="help-center__notice-link"
							onClick={ () => navigate( url ) }
						/>
					),
				} ) }
			</p>
		</div>
	);
};
