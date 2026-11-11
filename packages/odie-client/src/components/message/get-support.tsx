import { localizeUrl, translationExists } from '@automattic/i18n-utils';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useGetSupportInteractionById } from '../../data';
import { useRequestHumanSupport } from '../../hooks';
import { useOpenLiveInteractions } from '../../hooks/use-open-interaction-status-map';
import { getLatestHumanSupportFlags } from '../../utils/human-support-flags';

import './get-support.scss';

interface GetSupportProps {
	onClickAdditionalEvent?: ( destination: string, props?: Record< string, unknown > ) => void;
	// Called once, when the options are first shown, with where each one leads.
	onShow?: ( destinations: string[] ) => void;
	isUserEligibleForPaidSupport?: boolean;
	canConnectToZendesk?: boolean;
	forceEmailSupport?: boolean;
	forceAIConversation?: boolean;
}

interface ButtonConfig {
	className?: string;
	destination: string;
	disabled?: boolean;
	text: string | React.ReactNode;
	action: () => Promise< void >;
	waitTimeText?: string;
	hideButton?: boolean;
}

export const GetSupport: React.FC< GetSupportProps > = ( {
	onClickAdditionalEvent,
	onShow,
	isUserEligibleForPaidSupport,
	canConnectToZendesk = false,
	forceEmailSupport = false,
	forceAIConversation = false,
} ) => {
	const navigate = useNavigate();
	const requestHumanSupport = useRequestHumanSupport();
	const { search } = useLocation();
	const params = new URLSearchParams( search );

	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk: contextCanConnectToZendesk,
		trackEvent,
		isChatLoaded,
		forceEmailSupport: contextForceEmailSupport,
		humanSupportRouting,
	} = useOdieAssistantContext();

	const { mostRecentSupportInteractionId, hasReachedLimit: isConversationLimitReached } =
		useOpenLiveInteractions();

	const { data: supportInteraction, isLoading: isLoadingSupportInteraction } =
		useGetSupportInteractionById( mostRecentSupportInteractionId || null );

	// With a routing step, the host decides who gets a human.
	const isPaidUser =
		isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport || !! humanSupportRouting;
	const isEmailForced = forceEmailSupport || contextForceEmailSupport;
	const hasZendeskAccess = canConnectToZendesk || contextCanConnectToZendesk;

	// Hidden when the user is already talking to a human or transferring to Zendesk.
	const isHidden = chat.provider !== 'odie' || chat.status === 'transfer';

	const getButtonConfig = (): ButtonConfig[] => {
		const buttons: ButtonConfig[] = [];

		if ( isPaidUser ) {
			if ( isEmailForced || ( ! isChatLoaded && ! forceAIConversation ) ) {
				buttons.push( {
					destination: 'email',
					text: __( 'Send an email', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'email' );
						params.set( 'wapuuFlow', 'true' );
						navigate( '/contact-form?' + params.toString() );
					},
				} );
			} else if ( isConversationLimitReached ) {
				buttons.push( {
					destination: 'chat-history',
					text: (
						<>
							{ __( 'View my conversations', __i18n_text_domain__ ) }
							<Icon icon={ chevronRight } />
						</>
					),
					action: async () => {
						trackEvent( 'chat_view_support_history_from_limit' );
						navigate( '/chat-history' );
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
						destination: 'previous-conversation',
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
						destination: 'chat-ai',
						text: __( 'Get support', __i18n_text_domain__ ),
						action: async () => {
							const params = new URLSearchParams( search );
							onClickAdditionalEvent?.( 'chat-ai' );
							navigate( '/odie?' + params.toString() );
						},
					} );
				} else if ( hasZendeskAccess ) {
					buttons.push( {
						destination: 'chat',
						text: supportInteraction
							? __( 'No, connect me with someone new', __i18n_text_domain__ )
							: __( 'Get support', __i18n_text_domain__ ),
						action: async () => {
							onClickAdditionalEvent?.( 'chat', {
								has_open_conversation: !! supportInteraction,
							} );
							await requestHumanSupport( {
								createdFrom: 'chat_support_button',
								flags: getLatestHumanSupportFlags( chat.messages ),
							} );
						},
					} );
				}
			}

			return buttons;
		}

		return [
			{
				destination: 'forum',
				text: __( 'Ask in our forums', __i18n_text_domain__ ),
				action: async () => {
					onClickAdditionalEvent?.( 'forum' );
					window.open( localizeUrl( 'https://wordpress.com/forums/?new=1' ), '_blank' );
				},
			},
		];
	};

	const buttonConfig = isHidden ? [] : getButtonConfig();
	// The open conversation adds an option, so wait for it before reporting what's shown.
	const shownDestinations = isLoadingSupportInteraction
		? ''
		: buttonConfig.map( ( { destination } ) => destination ).join( ',' );

	const hasReportedShowRef = useRef( false );
	useEffect( () => {
		if ( ! shownDestinations || hasReportedShowRef.current ) {
			return;
		}
		hasReportedShowRef.current = true;
		onShow?.( shownDestinations.split( ',' ) );
	}, [ shownDestinations, onShow ] );

	if ( isHidden ) {
		return null;
	}

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
