/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { BackButton } from './back-button';
import { SuccessIcon } from './success-icon';

import './ticket-success-screen.scss';

export const SuccessScreen: React.FC = () => {
	const { __ } = useI18n();
	const { search } = useLocation();
	const { sectionName } = useHelpCenterContext();
	const params = new URLSearchParams( search );
	const forumTopicUrl = params.get( 'forumTopic' );

	const trackForumOpen = () =>
		recordTracksEvent( 'calypso_inlinehelp_forums_open', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

	return (
		<div>
			<BackButton backToRoot />
			<div className="ticket-success-screen__help-center">
				<SuccessIcon />
				<h1 className="ticket-success-screen__help-center-heading">
					{ __( "We're on it!", __i18n_text_domain__ ) }
				</h1>
				{ forumTopicUrl ? (
					<p className="ticket-success-screen__help-center-message">
						{ __(
							'Your message has been submitted to our community forums.',
							__i18n_text_domain__
						) }
						&nbsp;
						<a
							target="_blank"
							rel="noopener noreferrer"
							onClick={ trackForumOpen }
							href={ forumTopicUrl }
						>
							{ __( 'View the forums topic here.', __i18n_text_domain__ ) }
						</a>
					</p>
				) : (
					<p className="ticket-success-screen__help-center-message">
						{ __(
							"We've received your message, and you'll hear back from one of our Happiness Engineers shortly.",
							__i18n_text_domain__
						) }
					</p>
				) }
			</div>
		</div>
	);
};
