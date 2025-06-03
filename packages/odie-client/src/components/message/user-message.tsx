import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { ExternalLink } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Markdown from 'react-markdown';
import {
	ODIE_FORWARD_TO_FORUMS_MESSAGE,
	ODIE_FORWARD_TO_ZENDESK_MESSAGE,
	ODIE_THIRD_PARTY_MESSAGE,
} from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { interactionHasZendeskEvent, userProvidedEnoughInformation } from '../../utils';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { GetSupport } from './get-support';
import Sources from './sources';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types';

const getDisplayMessage = (
	isUserEligibleForPaidSupport: boolean,
	canConnectToZendesk: boolean,
	isRequestingHumanSupport: boolean,
	messageContent: string,
	forwardMessage: string,
	hasCannedResponse?: boolean
) => {
	if ( isUserEligibleForPaidSupport && ! canConnectToZendesk && isRequestingHumanSupport ) {
		return ODIE_THIRD_PARTY_MESSAGE;
	}
	if ( isUserEligibleForPaidSupport && hasCannedResponse ) {
		return messageContent;
	}
	return forwardMessage;
};

export const UserMessage = ( {
	message,
	isDisliked = false,
	isMessageWithoutEscalationOption = false,
}: {
	isDisliked?: boolean;
	message: Message;
	isMessageWithoutEscalationOption?: boolean;
} ) => {
	const { isUserEligibleForPaidSupport, trackEvent, chat, canConnectToZendesk } =
		useOdieAssistantContext();

	const currentSupportInteraction = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getCurrentSupportInteraction(),
		[]
	);

	const hasCannedResponse = message.context?.flags?.canned_response;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support ?? false;
	const isBot = message.role === 'bot';
	const isConnectedToZendesk = chat?.provider === 'zendesk';

	const showDirectEscalationLink = useMemo( () => {
		return (
			! chat.conversationId &&
			userProvidedEnoughInformation( chat?.messages ) &&
			! interactionHasZendeskEvent( currentSupportInteraction )
		);
	}, [ chat.conversationId, currentSupportInteraction, chat?.messages ] );

	const forwardMessage = isUserEligibleForPaidSupport
		? ODIE_FORWARD_TO_ZENDESK_MESSAGE
		: ODIE_FORWARD_TO_FORUMS_MESSAGE;

	const displayMessage = getDisplayMessage(
		isUserEligibleForPaidSupport,
		canConnectToZendesk,
		isRequestingHumanSupport,
		message.content,
		forwardMessage,
		hasCannedResponse
	);

	const displayingThirdPartyMessage =
		isUserEligibleForPaidSupport && ! canConnectToZendesk && isRequestingHumanSupport;

	const renderExtraContactOptions = () => {
		const handleContactSupportClick = ( destination: string ) => {
			trackEvent( 'chat_get_support', {
				location: 'user-message',
				destination,
			} );
		};
		return (
			chat.provider === 'odie' && (
				<GetSupport onClickAdditionalEvent={ handleContactSupportClick } />
			)
		);
	};

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
			{ ! isConnectedToZendesk && (
				<>
					{ showDirectEscalationLink && <DirectEscalationLink messageId={ message.message_id } /> }
					{ ! message.rating_value && (
						<WasThisHelpfulButtons message={ message } isDisliked={ isDisliked } />
					) }
				</>
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
						'chat-feedback-wrapper-no-extra-contact': ! isRequestingHumanSupport,
						'chat-feedback-wrapper-third-party-cookies': displayingThirdPartyMessage,
					} ) }
				>
					<Sources message={ message } />
					{ isRequestingHumanSupport && renderExtraContactOptions() }
					{ isMessageShowingDisclaimer && renderDisclaimers() }
				</div>
			) }
		</>
	);
};
