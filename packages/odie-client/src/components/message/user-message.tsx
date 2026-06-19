import { getConversationLimitReachedMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
import { useOpenLiveInteractions } from '../../hooks/use-open-interaction-status-map';
import {
	interactionHasZendeskEvent,
	getIsRequestingHumanSupport,
	getIsLastBotMessage,
	getIsErrorMessage,
	getDisplayMessage,
} from '../../utils';
import BotMessageActions from './bot-message-actions';
import CustomALink from './custom-a-link';
import { GetSupport } from './get-support';
import { MarkdownOrChildren } from './mardown-or-children';
import Sources from './sources';
import type { Message } from '../../types';

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
		isChatLoaded,
		chat,
	} = useOdieAssistantContext();

	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const isRequestingHumanSupport = getIsRequestingHumanSupport( message );
	const isLastBotMessage = getIsLastBotMessage( chat, message );
	const { mostRecentSupportInteractionId: hasRecentOpenConversation, hasReachedLimit } =
		useOpenLiveInteractions();
	const isErrorMessage = getIsErrorMessage( message );
	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const showGetSupport = isLastBotMessage && ( isRequestingHumanSupport || isErrorMessage );
	const showActionButtons = ! isRequestingHumanSupport && ! isErrorMessage;

	const messageContent = () => {
		if ( ! isRequestingHumanSupport ) {
			return message.content;
		}

		if ( chat.provider === 'zendesk' ) {
			return '';
		}

		if ( hasReachedLimit ) {
			return getConversationLimitReachedMessage().content;
		}

		return getDisplayMessage(
			!! hasRecentOpenConversation,
			isUserEligibleForPaidSupport,
			canConnectToZendesk,
			forceEmailSupport,
			isChatRestricted,
			message?.context?.flags?.is_error_message,
			isChatLoaded
		);
	};

	return (
		<>
			<div className="odie-chatbox-message__content">
				<MarkdownOrChildren
					messageContent={ messageContent() }
					components={ {
						a: ( props: React.ComponentProps< 'a' > ) => <CustomALink { ...props } />,
					} }
				/>
			</div>
			{ isMessageWithEscalationOption && (
				<>
					{ showGetSupport && (
						<GetSupport
							onClickAdditionalEvent={ ( destination ) => {
								trackEvent( 'chat_get_support', {
									location: 'user-message',
									destination,
								} );
							} }
						/>
					) }{ ' ' }
					{ showActionButtons && (
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
