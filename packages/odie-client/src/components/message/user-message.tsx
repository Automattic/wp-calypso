import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { ODIE_FORWARD_TO_FORUMS_MESSAGE, ODIE_FORWARD_TO_ZENDESK_MESSAGE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { GetSupport } from './get-support';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types/';

export const UserMessage = ( {
	message,
	isDisliked = false,
}: {
	isDisliked?: boolean;
	message: Message;
} ) => {
	const { extraContactOptions, isUserEligibleForPaidSupport, shouldUseHelpCenterExperience } =
		useOdieAssistantContext();

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const hasFeedback = !! message?.rating_value;
	const isBot = message.role === 'bot';
	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;
	const showExtraContactOptions =
		( hasFeedback && ! isPositiveFeedback ) || isRequestingHumanSupport;

	const forwardMessage = isUserEligibleForPaidSupport
		? ODIE_FORWARD_TO_ZENDESK_MESSAGE
		: ODIE_FORWARD_TO_FORUMS_MESSAGE;

	const displayMessage =
		isUserEligibleForPaidSupport && hasCannedResponse ? message.content : forwardMessage;

	return (
		<>
			<Markdown
				urlTransform={ uriTransformer }
				components={ {
					a: CustomALink,
				} }
			>
				{ isRequestingHumanSupport ? displayMessage : message.content }
			</Markdown>
			<div className="chat-feedback-wrapper">
				{ showExtraContactOptions &&
					( shouldUseHelpCenterExperience ? <GetSupport /> : extraContactOptions ) }
				{ ! showExtraContactOptions && isBot && (
					<WasThisHelpfulButtons message={ message } isDisliked={ isDisliked } />
				) }
				{ isBot && (
					<>
						{ ! showExtraContactOptions && (
							<DirectEscalationLink messageId={ message.message_id } />
						) }
						<div className="disclaimer">
							{ __(
								'Powered by Support AI. Some responses may be inaccurate.',
								__i18n_text_domain__
							) }
							<ExternalLink href="https://automattic.com/ai-guidelines">
								{ __( 'Learn more.', __i18n_text_domain__ ) }
							</ExternalLink>
						</div>
					</>
				) }
			</div>
		</>
	);
};
