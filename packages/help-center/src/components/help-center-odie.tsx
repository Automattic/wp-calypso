/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import OdieAssistantProvider, {
	useOdieAssistantContext,
	EllipsisMenu,
	isOdieAllowedBot,
	useOdieSendMessage,
	MessagesContainer,
} from '@automattic/odie-client';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, {
	useCallback,
	useEffect,
	useState,
	type KeyboardEvent,
	type MouseEvent,
} from 'react';
import { Navigate } from 'react-router-dom';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { SendIcon } from '../icons/send';
import { HELP_CENTER_STORE } from '../stores';
/**
 * Internal Dependencies
 */
import { BackButtonHeader } from './back-button';
import './help-center-odie.scss';
import type { HelpCenterSelect } from '@automattic/data-stores';
import type { OdieAllowedBots } from '@automattic/odie-client/src/types/index';

interface ProtectedRouteProps {
	condition: boolean;
	redirectPath?: string;
	children: React.ReactNode;
}

export const HelpCenterSendButton = () => {
	const { setSupportProvider } = useDispatch( HELP_CENTER_STORE );
	const { provider } = useOdieAssistantContext();
	const [ messageString, setMessageString ] = useState< string >( '' );
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();

	useEffect( () => {
		setSupportProvider( provider );
	}, [ provider ] );

	const handleSendMessage = async (
		event: MouseEvent< HTMLButtonElement > | KeyboardEvent< HTMLTextAreaElement >
	) => {
		const isButtonClick = event.type === 'click';
		const isEnterKey = ( event as KeyboardEvent ).key === 'Enter' && ! event.shiftKey;

		if ( messageString.trim().length > 0 && ( isEnterKey || isButtonClick ) ) {
			event.preventDefault();
			setMessageString( '' );
			await sendOdieMessage( {
				message: {
					content: messageString as string,
					role: 'user',
					type: 'message',
				},
			} );
		}
	};

	return (
		<div className="help-center__container-odie-send-button">
			<textarea
				className="odie-send-message-input"
				rows={ 1 }
				value={ messageString }
				onChange={ ( event: React.ChangeEvent< HTMLTextAreaElement > ) =>
					setMessageString( event.currentTarget.value )
				}
				onKeyDown={ handleSendMessage }
			/>
			<button onClick={ handleSendMessage }>
				<SendIcon />
			</button>
		</div>
	);
};

// Prevent not eligible users from accessing odie/wapuu.
const ProtectedRoute: React.FC< ProtectedRouteProps > = ( {
	condition,
	redirectPath = '/',
	children,
} ) => {
	if ( condition ) {
		// redirect users home if they are not eligible for chat
		recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
			pathname: window.location.pathname,
			search: window.location.search,
		} );
		return <Navigate to={ redirectPath } replace />;
	}
	return children;
};

const OdieEllipsisMenu = () => {
	const { __ } = useI18n();
	const { clearChat } = useOdieAssistantContext();

	return (
		<EllipsisMenu
			popoverClassName="help-center help-center__container-header-menu"
			position="bottom"
		>
			<PopoverMenuItem
				onClick={ clearChat }
				className="help-center help-center__container-header-menu-item"
			>
				<Gridicon icon="comment" />
				{ __( 'Clear Conversation' ) }
			</PopoverMenuItem>
		</EllipsisMenu>
	);
};

export function HelpCenterOdie( {
	isLoadingEnvironment,
	isUserEligible,
	searchTerm,
}: {
	isLoadingEnvironment: boolean;
	isUserEligible: boolean;
	searchTerm: string;
} ): JSX.Element {
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligible;
	const { currentUser, site } = useHelpCenterContext();

	const { odieInitialPromptText, odieBotNameSlug, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		const odieBotNameSlug = isOdieAllowedBot( store.getOdieBotNameSlug() )
			? store.getOdieBotNameSlug()
			: 'wpcom-support-chat';

		return {
			odieInitialPromptText: store.getOdieInitialPromptText(),
			odieBotNameSlug: odieBotNameSlug as OdieAllowedBots,
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( eventName, properties );
		},
		[]
	);

	return (
		<ProtectedRoute condition={ preventOdieAccess }>
			<OdieAssistantProvider
				isLoadingEnvironment={ isLoadingEnvironment }
				botNameSlug={ odieBotNameSlug }
				botName="Wapuu"
				odieInitialPromptText={ odieInitialPromptText }
				currentUser={ currentUser }
				isMinimized={ isMinimized }
				initialUserMessage={ searchTerm }
				logger={ trackEvent }
				loggerEventNamePrefix="calypso_odie"
				selectedSiteId={ site?.ID as number }
				isUserEligible={ isUserEligible }
			>
				<div className="help-center__container-odie-header">
					<BackButtonHeader className="help-center__container-odie-back-button">
						<OdieEllipsisMenu />
					</BackButtonHeader>
				</div>
				<div className="help-center__container-content-odie">
					<MessagesContainer currentUser={ currentUser } />
				</div>
				<div className="help-center__container-footer chat-footer">
					<HelpCenterSendButton />
				</div>
			</OdieAssistantProvider>
		</ProtectedRoute>
	);
}
