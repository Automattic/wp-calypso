import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { ExternalLink } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
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
import {
	interactionHasZendeskEvent,
	userProvidedEnoughInformation,
	getIsRequestingHumanSupport,
} from '../../utils';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { GetSupport } from './get-support';
import { MarkdownOrChildren } from './mardown-or-children';
import Sources from './sources';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types';

const getDisplayMessage = (
	isUserEligibleForPaidSupport: boolean,
	canConnectToZendesk: boolean,
	isRequestingHumanSupport: boolean,
	messageContent: ReactNode,
	hasCannedResponse?: boolean,
	forceEmailSupport?: boolean,
	isErrorMessage?: boolean
) => {
	if ( isUserEligibleForPaidSupport && ! canConnectToZendesk && isRequestingHumanSupport ) {
		return getOdieThirdPartyMessageContent();
	}

	if ( isUserEligibleForPaidSupport && hasCannedResponse ) {
		return messageContent;
	}

	if ( isUserEligibleForPaidSupport && forceEmailSupport && isRequestingHumanSupport ) {
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
	isDisliked = false,
	isMessageWithEscalationOption = false,
}: {
	isDisliked?: boolean;
	message: Message;
	isMessageWithEscalationOption?: boolean;
} ) => {
	const { isUserEligibleForPaidSupport, trackEvent, chat, canConnectToZendesk, forceEmailSupport } =
		useOdieAssistantContext();

	const currentSupportInteraction = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getCurrentSupportInteraction(),
		[]
	);

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = getIsRequestingHumanSupport( message );

	const showDirectEscalationLink = useMemo( () => {
		return (
			canConnectToZendesk &&
			! chat.conversationId &&
			userProvidedEnoughInformation( chat?.messages ) &&
			! interactionHasZendeskEvent( currentSupportInteraction )
		);
	}, [ chat.conversationId, currentSupportInteraction, chat?.messages, canConnectToZendesk ] );

	const displayMessage = getDisplayMessage(
		isUserEligibleForPaidSupport,
		canConnectToZendesk,
		isRequestingHumanSupport,
		message.content,
		hasCannedResponse,
		forceEmailSupport,
		message?.context?.flags?.is_error_message
	);
	const displayingThirdPartyMessage =
		isUserEligibleForPaidSupport && ! canConnectToZendesk && isRequestingHumanSupport;

	const isMessageShowingDisclaimer =
		message.context?.question_tags?.inquiry_type !== 'request-for-human-support';

	const handleGuidelinesClick = () => {
		trackEvent?.( 'ai_guidelines_link_clicked' );
	};

	const renderDisclaimers = () => (
		<>
			<div className="disclaimer">
				{ createInterpolateElement(
					__(
						'Powered by Support AI. Some responses may be inaccurate. <a>Learn more</a>.',
						__i18n_text_domain__
					),
					{
						a: (
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							<ExternalLink
								href="https://automattic.com/ai-guidelines"
								onClick={ handleGuidelinesClick }
							/>
						),
					}
				) }
			</div>
			{ ! interactionHasZendeskEvent( currentSupportInteraction ) && (
				<>
					{ showDirectEscalationLink && <DirectEscalationLink messageId={ message.message_id } /> }
					{ ! message.rating_value && (
						<WasThisHelpfulButtons message={ message } isDisliked={ isDisliked } />
					) }
				</>
			) }
		</>
	);

	const messageContent = isRequestingHumanSupport ? displayMessage : message.content;

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
				<div
					className={ clsx( 'chat-feedback-wrapper', {
						'chat-feedback-wrapper-no-extra-contact': ! isRequestingHumanSupport,
						'chat-feedback-wrapper-third-party-cookies': displayingThirdPartyMessage,
					} ) }
				>
					<Sources message={ message } />
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
					{ isMessageShowingDisclaimer && renderDisclaimers() }
				</div>
			) }
		</>
	);
};
