import clsx from 'clsx';
import Markdown from 'react-markdown';
import { ODIE_FORWARD_TO_FORUMS_MESSAGE, ODIE_FORWARD_TO_ZENDESK_MESSAGE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { userProvidedEnoughInformation } from '../../utils';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { GetSupport } from './get-support';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types';

export const UserMessage = ( {
	message,
	isDisliked = false,
	isMessageWithoutEscalationOption = false,
}: {
	isDisliked?: boolean;
	message: Message;
	isMessageWithoutEscalationOption?: boolean;
} ) => {
	const { isUserEligibleForPaidSupport, trackEvent, chat } = useOdieAssistantContext();

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support ?? false;
	const hasFeedback = !! message?.rating_value;
	const isBot = message.role === 'bot';
	const isConnectedToZendesk = chat?.provider === 'zendesk';
	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;

	const showExtraContactOptions =
		( hasFeedback && ! isPositiveFeedback ) || isRequestingHumanSupport;

	const showDirectEscalationLink = userProvidedEnoughInformation( chat?.messages );

	const forwardMessage = isUserEligibleForPaidSupport
		? ODIE_FORWARD_TO_ZENDESK_MESSAGE
		: ODIE_FORWARD_TO_FORUMS_MESSAGE;

	const displayMessage =
		isUserEligibleForPaidSupport && hasCannedResponse ? message.content : forwardMessage;

	const handleContactSupportClick = ( destination: string ) => {
		trackEvent( 'chat_get_support', {
			location: 'user-message',
			destination,
		} );
	};

	const renderExtraContactOptions = () => {
		return (
			chat.provider === 'odie' && (
				<GetSupport onClickAdditionalEvent={ handleContactSupportClick } />
			)
		);
	};

	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const renderDisclaimers = () => (
		<>
			{ showDirectEscalationLink && <DirectEscalationLink messageId={ message.message_id } /> }
			{ ! isConnectedToZendesk && (
				<WasThisHelpfulButtons message={ message } isDisliked={ isDisliked } />
			) }
		</>
	);

	return (
		<>
			<div className="odie-chatbox-message__content">
				<Markdown
					urlTransform={ uriTransformer }
					components={ {
						a: ( props: React.ComponentProps< 'a' > ) => (
							<CustomALink { ...props } target="_blank" />
						),
					} }
				>
					{ isRequestingHumanSupport ? displayMessage : message.content }
				</Markdown>
			</div>
			{ ! isMessageWithoutEscalationOption && isBot && (
				<div
					className={ clsx( 'chat-feedback-wrapper', {
						'chat-feedback-wrapper-no-extra-contact': ! showExtraContactOptions,
					} ) }
				>
					{ showExtraContactOptions && renderExtraContactOptions() }
					{ isMessageShowingDisclaimer && renderDisclaimers() }
				</div>
			) }
		</>
	);
};
