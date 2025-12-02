import {
	getOdieForwardToForumsMessage,
	getOdieForwardToZendeskMessage,
	getOdieThirdPartyMessageContent,
	getOdieEmailFallbackMessageContent,
	getOdieErrorMessage,
	getOdieErrorMessageNonEligible,
} from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
import {
	interactionHasZendeskEvent,
	getIsRequestingHumanSupport,
	getIsLastBotMessage,
} from '../../utils';
import getMostRecentOpenLiveInteraction from '../notices/get-most-recent-open-live-interaction';
import BotMessageActions from './bot-message-actions';
import CustomALink from './custom-a-link';
import { GetSupport } from './get-support';
import { MarkdownOrChildren } from './mardown-or-children';
import Sources from './sources';
import type { Message } from '../../types';

const getDisplayMessage = (
	userHasRecentOpenConversation: boolean,
	isUserEligibleForPaidSupport: boolean,
	canConnectToZendesk: boolean,
	forceEmailSupport?: boolean,
	isChatRestricted?: boolean,
	isErrorMessage?: boolean
) => {
	if ( isUserEligibleForPaidSupport && ! canConnectToZendesk ) {
		return getOdieThirdPartyMessageContent();
	}

	if ( isUserEligibleForPaidSupport && forceEmailSupport ) {
		return getOdieEmailFallbackMessageContent( isChatRestricted );
	}

	if ( isErrorMessage && ! isUserEligibleForPaidSupport ) {
		return getOdieErrorMessageNonEligible();
	}

	const forwardMessage = isUserEligibleForPaidSupport
		? getOdieForwardToZendeskMessage( userHasRecentOpenConversation )
		: getOdieForwardToForumsMessage();

	return isErrorMessage ? getOdieErrorMessage() : forwardMessage;
};

export const UserMessage = ( {
	message,
	isMessageWithEscalationOption = false,
}: {
	message: Message;
	isMessageWithEscalationOption?: boolean;
} ) => {
	const {
		isUserEligibleForPaidSupport,
		trackEvent,
		canConnectToZendesk,
		forceEmailSupport,
		isChatRestricted,
		chat,
	} = useOdieAssistantContext();

	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const isRequestingHumanSupport = getIsRequestingHumanSupport( message );
	const isLastBotMessage = getIsLastBotMessage( chat, message );
	const hasRecentOpenConversation = getMostRecentOpenLiveInteraction();

	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const messageContent = isRequestingHumanSupport
		? getDisplayMessage(
				!! hasRecentOpenConversation,
				isUserEligibleForPaidSupport,
				canConnectToZendesk,
				forceEmailSupport,
				isChatRestricted,
				message?.context?.flags?.is_error_message
		  )
		: message.content;

	return (
		<>
			<div className="odie-chatbox-message__content">
				<MarkdownOrChildren
					messageContent={ messageContent }
					components={ {
						a: ( props: React.ComponentProps< 'a' > ) => (
							<CustomALink { ...props } target="_blank" />
						),
					} }
				/>
			</div>
			{ isMessageWithEscalationOption && (
				<>
					{ isRequestingHumanSupport && isLastBotMessage && (
						<GetSupport
							onClickAdditionalEvent={ ( destination ) => {
								trackEvent( 'chat_get_support', {
									location: 'user-message',
									destination,
								} );
							} }
						/>
					) }{ ' ' }
					{ ! isRequestingHumanSupport && (
						<>
							{ ! interactionHasZendeskEvent( currentSupportInteraction ) && (
								<BotMessageActions message={ message } />
							) }
							<div className="chat-feedback-wrapper">
								<Sources
									message={ message }
									isMessageShowingDisclaimer={ isMessageShowingDisclaimer }
								/>
							</div>
						</>
					) }
				</>
			) }
		</>
	);
};
