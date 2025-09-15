import { ReactNode } from 'react';
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
import { interactionHasZendeskEvent, getIsRequestingHumanSupport } from '../../utils';
import BotMessageActions from './bot-message-actions';
import CustomALink from './custom-a-link';
import { GetSupport } from './get-support';
import { MarkdownOrChildren } from './mardown-or-children';
import Sources from './sources';
import type { Message } from '../../types';

const getDisplayMessage = (
	isUserEligibleForPaidSupport: boolean,
	canConnectToZendesk: boolean,
	messageContent: ReactNode,
	hasCannedResponse?: boolean,
	forceEmailSupport?: boolean,
	isErrorMessage?: boolean
) => {
	if ( isUserEligibleForPaidSupport && ! canConnectToZendesk ) {
		return getOdieThirdPartyMessageContent();
	}

	if ( isUserEligibleForPaidSupport && hasCannedResponse ) {
		return messageContent;
	}

	if ( isUserEligibleForPaidSupport && forceEmailSupport ) {
		return getOdieEmailFallbackMessageContent();
	}

	if ( isErrorMessage && ! isUserEligibleForPaidSupport ) {
		return getOdieErrorMessageNonEligible();
	}

	const forwardMessage = isUserEligibleForPaidSupport
		? getOdieForwardToZendeskMessage()
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
	const { isUserEligibleForPaidSupport, trackEvent, canConnectToZendesk, forceEmailSupport } =
		useOdieAssistantContext();

	const { data: currentSupportInteraction } = useCurrentSupportInteraction();

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = getIsRequestingHumanSupport( message );

	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const messageContent = isRequestingHumanSupport
		? getDisplayMessage(
				isUserEligibleForPaidSupport,
				canConnectToZendesk,
				message.content,
				hasCannedResponse,
				forceEmailSupport,
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
					{ ! isRequestingHumanSupport &&
						! interactionHasZendeskEvent( currentSupportInteraction ) && (
							<BotMessageActions message={ message } />
						) }
					<div className="chat-feedback-wrapper">
						<Sources
							message={ message }
							isMessageShowingDisclaimer={ isMessageShowingDisclaimer }
						/>
						{ isRequestingHumanSupport && (
							<GetSupport
								onClickAdditionalEvent={ ( destination ) => {
									trackEvent( 'chat_get_support', {
										location: 'user-message',
										destination,
									} );
								} }
							/>
						) }
					</div>
				</>
			) }
		</>
	);
};
