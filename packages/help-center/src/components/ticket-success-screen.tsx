import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { BackButton } from './back-button';
import { SuccessIcon } from './success-icon';
import type { SuccessScreenProps } from '../types';

export const SuccessScreen: React.FC< SuccessScreenProps > = ( { onBack, forumTopicUrl } ) => {
	const { __ } = useI18n();

	return (
		<div>
			<BackButton onClick={ onBack } />
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
						<a target="_blank" rel="noopener noreferrer" href={ forumTopicUrl }>
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
