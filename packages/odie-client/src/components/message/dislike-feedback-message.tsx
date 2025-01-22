import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { WapuuAvatar } from '../../assets/wapuu-avatar';
import { useOdieAssistantContext } from '../../context';
import { GetSupport } from './get-support';

export const DislikeFeedbackMessage = () => {
	const { botName, isUserEligibleForPaidSupport, trackEvent } = useOdieAssistantContext();

	const handleContactSupportClick = ( destination: string ) => {
		trackEvent( 'chat_get_support', {
			location: 'dislike-feedback',
			destination,
			is_user_eligible: isUserEligibleForPaidSupport,
			bot_name: botName,
		} );
	};

	const renderEligibleUserMessage = () => {
		return (
			<Markdown>
				{ __(
					'Let’s get the information you need. Would you like to contact our support team?',
					__i18n_text_domain__
				) }
			</Markdown>
		);
	};

	const renderNotEligibleUserMessage = () => {
		return (
			<>
				<Markdown>{ __( "Sorry I couldn't be of help!", __i18n_text_domain__ ) }</Markdown>
				<Markdown>
					{ __(
						'A great way to get assistance is by bringing your questions to our public forums—just be sure to avoid sharing any personal or financial details.',
						__i18n_text_domain__
					) }
				</Markdown>
			</>
		);
	};

	return (
		<>
			<div className="message-header bot">
				<WapuuAvatar />
			</div>
			<div className="odie-chatbox-dislike-feedback-message">
				{ isUserEligibleForPaidSupport
					? renderEligibleUserMessage()
					: renderNotEligibleUserMessage() }
			</div>

			<GetSupport onClickAdditionalEvent={ handleContactSupportClick } />
		</>
	);
};

export default DislikeFeedbackMessage;
