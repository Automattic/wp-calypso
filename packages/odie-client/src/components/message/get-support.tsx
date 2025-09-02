import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Icon } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useGetSupportInteractionById } from '../../data';
import { useCreateZendeskConversation } from '../../hooks';
import { useGetMostRecentOpenConversation } from '../../hooks/use-get-most-recent-open-conversation';

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
	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk: contextCanConnectToZendesk,
		trackEvent,
		isChatLoaded,
		forceEmailSupport: contextForceEmailSupport,
	} = useOdieAssistantContext();

	const { mostRecentSupportInteractionId } = useGetMostRecentOpenConversation();

	const { data: supportInteraction } = useGetSupportInteractionById(
		mostRecentSupportInteractionId?.toString() ?? null
	);

	const { setCurrentSupportInteraction } = useDataStoreDispatch( HELP_CENTER_STORE );

	// Early return if user is already talking to a human
	if ( chat.provider !== 'odie' ) {
		return null;
	}

	const getButtonConfig = (): ButtonConfig[] => {
		const buttons: ButtonConfig[] = [];

		if ( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport ) {
			if ( forceEmailSupport || contextForceEmailSupport ) {
				buttons.push( {
					text: __( 'Email support', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'email' );
						navigate( '/contact-form?mode=EMAIL&wapuuFlow=true' );
					},
				} );
			} else {
				if ( supportInteraction ) {
					buttons.push( {
						text: (
							<>
								{ __( 'Yes, please take me to that chat', __i18n_text_domain__ ) }
								<Icon icon={ chevronRight } />
							</>
						),
						action: async () => {
							trackEvent( 'chat_open_previous_conversation' );
							setCurrentSupportInteraction( supportInteraction );
							navigate( '/odie?id=' + mostRecentSupportInteractionId );
						},
					} );
				}

				if ( forceAIConversation ) {
					buttons.push( {
						text: __( 'Get support', __i18n_text_domain__ ),
						action: async () => {
							onClickAdditionalEvent?.( 'chat-ai' );
							navigate( '/odie' );
						},
					} );
				} else if ( canConnectToZendesk || contextCanConnectToZendesk ) {
					buttons.push( {
						text: __( 'No thanks, let’s keep it here', __i18n_text_domain__ ),
						action: async () => {
							onClickAdditionalEvent?.( 'chat' );
							if ( isChatLoaded ) {
								createZendeskConversation( {
									avoidTransfer: true,
									interactionId: mostRecentSupportInteractionId?.toString() ?? '',
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
					navigate( '/contact-form?mode=FORUM' );
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
