import { localizeUrl, translationExists } from '@automattic/i18n-utils';
import { Icon } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useGetSupportInteractionById } from '../../data';
import { useCreateZendeskConversation } from '../../hooks';
import getMostRecentOpenLiveInteraction from '../notices/get-most-recent-open-live-interaction';

import './get-support.scss';

interface GetSupportProps {
	onClickAdditionalEvent?: ( destination: string ) => void;
	isUserEligibleForPaidSupport?: boolean;
	canConnectToZendesk?: boolean;
	forceEmailSupport?: boolean;
	forceAIConversation?: boolean;
}

interface ButtonConfig {
	className?: string;
	disabled?: boolean;
	text: string | React.ReactNode;
	action: () => Promise< void >;
	waitTimeText?: string;
	hideButton?: boolean;
}

export const GetSupport: React.FC< GetSupportProps > = ( {
	onClickAdditionalEvent,
	isUserEligibleForPaidSupport,
	canConnectToZendesk = false,
	forceEmailSupport = false,
	forceAIConversation = false,
} ) => {
	const navigate = useNavigate();
	const createZendeskConversation = useCreateZendeskConversation();
	const { search } = useLocation();
	const params = new URLSearchParams( search );

	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk: contextCanConnectToZendesk,
		trackEvent,
		isChatLoaded,
		forceEmailSupport: contextForceEmailSupport,
	} = useOdieAssistantContext();

	const mostRecentSupportInteractionId = getMostRecentOpenLiveInteraction();

	const { data: supportInteraction } = useGetSupportInteractionById(
		mostRecentSupportInteractionId || null
	);

	const isPaidUser = isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport;
	const isEmailForced = forceEmailSupport || contextForceEmailSupport;
	const hasZendeskAccess = canConnectToZendesk || contextCanConnectToZendesk;
	const showExistingChatOptions =
		isPaidUser &&
		! isEmailForced &&
		! forceAIConversation &&
		supportInteraction &&
		hasZendeskAccess;

	const [ hasTrackedExistingChatOptions, setHasTrackedExistingChatOptions ] = useState( false );

	// Track when "existing chat" options are shown to the user
	useEffect( () => {
		if ( showExistingChatOptions && ! hasTrackedExistingChatOptions ) {
			setHasTrackedExistingChatOptions( true );
			trackEvent( 'chat_existing_conversation_options_shown' );
		}
	}, [ showExistingChatOptions, hasTrackedExistingChatOptions, trackEvent ] );

	// Early return if user is already talking to a human or transferring to Zendesk
	if ( chat.provider !== 'odie' || chat.status === 'transfer' ) {
		return null;
	}

	const getButtonConfig = (): ButtonConfig[] => {
		const buttons: ButtonConfig[] = [];

		if ( isPaidUser ) {
			if ( isEmailForced ) {
				buttons.push( {
					text: __( 'Send an email', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'email' );
						params.set( 'wapuuFlow', 'true' );
						navigate( '/contact-form?' + params.toString() );
					},
				} );
			} else {
				if ( supportInteraction ) {
					const existingConversationCtaText = translationExists(
						'Yes, go back to that conversation'
					)
						? __( 'Yes, go back to that conversation', __i18n_text_domain__ )
						: __( 'Yes, please take me to that chat', __i18n_text_domain__ );

					buttons.push( {
						text: (
							<>
								{ existingConversationCtaText }
								<Icon icon={ chevronRight } />
							</>
						),
						action: async () => {
							const params = new URLSearchParams( search );
							params.set( 'id', supportInteraction.uuid );
							trackEvent( 'chat_open_previous_conversation' );
							navigate( '/odie?' + params.toString() );
						},
					} );
				}

				if ( forceAIConversation ) {
					buttons.push( {
						text: __( 'Get support', __i18n_text_domain__ ),
						action: async () => {
							const params = new URLSearchParams( search );
							onClickAdditionalEvent?.( 'chat-ai' );
							navigate( '/odie?' + params.toString() );
						},
					} );
				} else if ( hasZendeskAccess ) {
					const startNewConversationText = translationExists( 'No, connect me with someone new' )
						? __( 'No, connect me with someone new', __i18n_text_domain__ )
						: __( 'No thanks, let’s keep it here', __i18n_text_domain__ );

					buttons.push( {
						text: supportInteraction
							? startNewConversationText
							: __( 'Get support', __i18n_text_domain__ ),
						action: async () => {
							onClickAdditionalEvent?.( 'chat' );
							if ( isChatLoaded ) {
								createZendeskConversation( {
									createdFrom: 'chat_support_button',
								} );
							}
						},
					} );
				}
			}

			return buttons;
		}

		return [
			{
				text: __( 'Ask in our forums', __i18n_text_domain__ ),
				action: async () => {
					onClickAdditionalEvent?.( 'forum' );
					window.open( localizeUrl( 'https://wordpress.com/forums/?new=1' ), '_blank' );
				},
			},
		];
	};

	const buttonConfig = getButtonConfig();

	const handleClick = async (
		event: React.MouseEvent< HTMLButtonElement >,
		button: ButtonConfig
	) => {
		event.preventDefault();
		await button.action();
	};

	return (
		<div className="odie__transfer-chat">
			{ buttonConfig.map( ( button, index ) => (
				<React.Fragment key={ index }>
					<button onClick={ ( e ) => handleClick( e, button ) } disabled={ button.disabled }>
						{ button.text }
					</button>
					{ button.waitTimeText && (
						<span className="odie__transfer-chat--wait-time">{ button.waitTimeText }</span>
					) }
				</React.Fragment>
			) ) }
		</div>
	);
};
