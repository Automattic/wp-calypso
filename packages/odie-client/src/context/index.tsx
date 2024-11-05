import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { createContext, useCallback, useContext, useState } from 'react';
import { broadcastChatClearance, useSetOdieStorage, useOdieBroadcastWithCallbacks } from '../data';
import { useChat } from '../query/use-chat';
import { isOdieAllowedBot } from '../utils';
import { getHelpCenterZendeskConversationStarted } from '../utils/storage-utils';
import type {
	Chat,
	CurrentUser,
	Message,
	Nudge,
	OdieAllowedBots,
	SupportProvider,
} from '../types/';
import type { HelpCenterSelect } from '@automattic/data-stores';
import type { ReactNode, FC, PropsWithChildren, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
type ScrollToLastMessageType = () => void;

/*
 * This is the interface for the context. It contains all the methods and values that are
 * available to the components that are wrapped in the provider.
 *
 */
type OdieAssistantContextInterface = {
	isChatLoaded: boolean;
	supportProvider: SupportProvider;
	setSupportProvider: ( provider: SupportProvider ) => void;
	shouldUseHelpCenterExperience: boolean;
	addMessage: ( message: Message | Message[] ) => void;
	botName?: string;
	botNameSlug: OdieAllowedBots;
	chat: Chat;
	clearChat: () => void;
	currentUser: CurrentUser;
	initialUserMessage: string | null | undefined;
	isLoadingEnvironment: boolean;
	isMinimized?: boolean;
	isUserEligibleForPaidSupport: boolean;
	isNudging: boolean;
	isVisible: boolean;
	extraContactOptions?: ReactNode;
	lastNudge: Nudge | null;
	odieClientId: string;
	sendNudge: ( nudge: Nudge ) => void;
	selectedSiteId?: number | null;
	selectedConversationId?: string | null;
	waitAnswerToFirstMessageFromHumanSupport: boolean;
	setChat: ( chat: SetStateAction< Chat > ) => void;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setScrollToLastMessage: ( scrollToLastMessage: ScrollToLastMessageType ) => void;
	scrollToLastMessage: ScrollToLastMessageType | null;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
	chatStatus: 'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer';
	setChatStatus: ( chatStatus: 'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer' ) => void;
	version?: string | null;
	setWaitAnswerToFirstMessageFromHumanSupport: (
		waitAnswerToFirstMessageFromHumanSupport: boolean
	) => void;
};

const defaultContextInterfaceValues = {
	isChatLoaded: false,
	supportProvider: 'odie' as SupportProvider,
	shouldUseHelpCenterExperience: false,
	addMessage: noop,
	botName: 'Wapuu',
	botNameSlug: 'wpcom-support-chat' as OdieAllowedBots,
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	clearChat: noop,
	initialUserMessage: null,
	isLoadingEnvironment: false,
	isLoadingExistingChat: false,
	isMinimized: false,
	isNudging: false,
	isVisible: false,
	isUserEligibleForPaidSupport: false,
	lastNudge: null,
	lastMessageRef: null,
	odieClientId: '',
	currentUser: { display_name: 'Me' },
	waitAnswerToFirstMessageFromHumanSupport: false,
	sendNudge: noop,
	setChat: noop,
	setMessageLikedStatus: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setSupportProvider: noop,
	setScrollToLastMessage: noop,
	scrollToLastMessage: noop,
	trackEvent: noop,
	setChatStatus: noop,
	chatStatus: 'loading' as 'loading' | 'loaded' | 'sending',
	setWaitAnswerToFirstMessageFromHumanSupport: noop,
};

// Create a default new context
const OdieAssistantContext = createContext< OdieAssistantContextInterface >(
	defaultContextInterfaceValues
);

// Custom hook to access the OdieAssistantContext
const useOdieAssistantContext = () => useContext( OdieAssistantContext );

// Generate random client id
export const odieClientId = Math.random().toString( 36 ).substring( 2, 15 );

type OdieAssistantProviderProps = {
	shouldUseHelpCenterExperience?: boolean;
	botName?: string;
	botNameSlug?: OdieAllowedBots;
	enabled?: boolean;
	initialUserMessage?: string | null | undefined;
	isUserEligibleForPaidSupport?: boolean;
	isMinimized?: boolean;
	isLoadingEnvironment?: boolean;
	currentUser: CurrentUser;
	extraContactOptions?: ReactNode;
	selectedSiteId?: number | null;
	selectedConversationId?: string | null;
	version?: string | null;
	children?: ReactNode;
} & PropsWithChildren;
// Create a provider component for the context
const OdieAssistantProvider: FC< OdieAssistantProviderProps > = ( {
	botName = 'Wapuu assistant',
	initialUserMessage,
	isLoadingEnvironment = false,
	isUserEligibleForPaidSupport = true,
	extraContactOptions,
	enabled = true,
	selectedSiteId,
	selectedConversationId,
	version = null,
	currentUser,
	children,
} ) => {
	const [ supportProvider, setSupportProvider ] = useState< SupportProvider >( 'odie' );
	const [ chatStatus, setChatStatus ] = useState<
		'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer'
	>( 'loading' );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ waitAnswerToFirstMessageFromHumanSupport, setWaitAnswerToFirstMessageFromHumanSupport ] =
		useState( getHelpCenterZendeskConversationStarted() !== null );
	const [ scrollToLastMessage, setScrollToLastMessage ] =
		useState< ScrollToLastMessageType | null >( null );
	const { shouldUseHelpCenterExperience } = useOdieAssistantContext();

	const { botNameSlug, isMinimized, isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		const odieBotNameSlug = isOdieAllowedBot( store.getOdieBotNameSlug() )
			? store.getOdieBotNameSlug()
			: 'wpcom-support-chat';

		return {
			botNameSlug: odieBotNameSlug as OdieAllowedBots,
			isMinimized: store.getIsMinimized(),
			isChatLoaded: store.getIsChatLoaded(),
		};
	}, [] );

	const { currentChat, addMessageToChatArray: addMessage, updateMessageInChatArray } = useChat();

	const urlSearchParams = new URLSearchParams( window.location.search );
	const versionParams = urlSearchParams.get( 'version' );

	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( `calypso_odie_${ eventName }`, {
				...properties,
				chat_id: currentChat?.chat_id,
				bot_name_slug: botNameSlug,
			} );
		},
		[ botNameSlug, currentChat.chat_id ]
	);

	const setOdieStorage = useSetOdieStorage( 'chat_id' );

	// TODO: replace this with the new clearChat function
	const clearChat = useCallback( () => {
		trackEvent( 'chat_cleared', {} );
		setMainChatState( emptyChat );
		resetSupportInteraction();
	}, [ trackEvent, resetSupportInteraction ] );

	const setMessageLikedStatus = useCallback(
		( message: Message, liked: boolean ) => {
			updateMessageInChatArray( ( prevChat ) => {
				const messageIndex = prevChat.messages.findIndex( ( m ) => m === message );
				const updatedMessage = { ...message, liked };
				return {
					...prevChat,
					messages: [
						...prevChat.messages.slice( 0, messageIndex ),
						updatedMessage,
						...prevChat.messages.slice( messageIndex + 1 ),
					],
				};
			} );
		},
		[ updateMessageInChatArray ]
	);

	useOdieBroadcastWithCallbacks( { addMessage, clearChat }, odieClientId );

	const overriddenVersion = versionParams || version;

	if ( ! enabled ) {
		return <>{ children }</>;
	}

	return (
		<OdieAssistantContext.Provider
			value={ {
				isChatLoaded,
				supportProvider,
				setSupportProvider,
				shouldUseHelpCenterExperience: config.isEnabled( 'help-center-experience' ),
				addMessage,
				botName,
				botNameSlug,
				chat,
				clearChat,
				currentUser,
				extraContactOptions,
				initialUserMessage,
				isMinimized,
				isNudging,
				isVisible,
				lastNudge,
				odieClientId,
				selectedSiteId,
				selectedConversationId,
				waitAnswerToFirstMessageFromHumanSupport,
				sendNudge: setLastNudge,
				setChat,
				setMessageLikedStatus,
				setIsNudging,
				setIsVisible,
				setScrollToLastMessage: setScrollToLastMessage ?? noop,
				scrollToLastMessage: scrollToLastMessage ?? noop,
				trackEvent,
				version: overriddenVersion,
				isLoadingEnvironment,
				isUserEligibleForPaidSupport,
				chatStatus,
				setChatStatus,
				setWaitAnswerToFirstMessageFromHumanSupport,
			} }
		>
			{ children }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, useOdieAssistantContext, OdieAssistantProvider };
