import { useEffect, useRef } from '@wordpress/element';
import { useAgentsManagerContext } from '../../contexts';
import { getChatPresentation } from '../../utils/chat-presentation';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { useAiChatEntryState } from '../use-ai-chat-entry-state';
import useHasAiChatEntryButton, {
	ADMIN_BAR_AI_CHAT_BUTTON_ID,
} from '../use-has-ai-chat-entry-button';
import '../../styles/ai-chat-label.scss';
import './style.scss';

// CSS class names
const CHAT_VISIBLE_CLASS = 'is-chat-visible';
const LABEL_REVEALED_CLASS = 'is-revealed';

interface UseAdminBarIntegrationOptions {
	openChat: () => void;
	closeChat: () => void;
}

/**
 * Custom hook to handle WordPress admin bar integration for agents-manager
 *
 * Manages:
 * - The AI chat button's click handler with tracking
 * - The AI chat button's "Agent" label, shown while the chat is hidden
 *
 * Returns whether the AI chat entry button is present on the page.
 */
export default function useAdminBarIntegration( {
	openChat,
	closeChat,
}: UseAdminBarIntegrationOptions ): boolean {
	const { dismissible, showEntryPoints } = getChatPresentation();
	const { resumeChat, sectionName } = useAgentsManagerContext();

	// Refs keep the latest callbacks without re-attaching DOM listeners each render.
	const openChatRef = useRef( openChat );
	openChatRef.current = openChat;
	const closeChatRef = useRef( closeChat );
	closeChatRef.current = closeChat;
	const resumeChatRef = useRef( resumeChat );
	resumeChatRef.current = resumeChat;

	const hasAiChatEntry = useHasAiChatEntryButton();
	const { isChatVisible } = useAiChatEntryState();

	// Read inside the one-time DOM click handler below to decide whether a
	// click opens or closes the chat.
	const isChatVisibleRef = useRef( false );
	isChatVisibleRef.current = isChatVisible;

	// PHP renders the label, pre-hidden when the persisted state says the chat
	// will restore visible; from here on the store decides (this hook mounts
	// only after that state has loaded). Only a label brought back by closing
	// the chat animates, never one painted with the page.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		const wasChatVisible = aiChatButton.classList.contains( CHAT_VISIBLE_CLASS );
		aiChatButton.classList.toggle( CHAT_VISIBLE_CLASS, isChatVisible );
		if ( wasChatVisible && ! isChatVisible ) {
			aiChatButton
				.querySelector( '.agents-manager-ai-chat-label' )
				?.classList.add( LABEL_REVEALED_CLASS );
		}
	}, [ isChatVisible ] );

	// The standalone AI button toggles the chat: close it if it's already showing,
	// otherwise resume the tab's conversation and open it.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		if ( ! showEntryPoints ) {
			const wasHidden = aiChatButton.hidden;
			aiChatButton.hidden = true;
			return () => {
				aiChatButton.hidden = wasHidden;
			};
		}

		const handleClick = () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
				surface: 'admin_bar',
				section: sectionName || 'wp-admin',
				action: dismissible && isChatVisibleRef.current ? 'close' : 'open',
			} );
			if ( dismissible && isChatVisibleRef.current ) {
				closeChatRef.current();
				return;
			}
			resumeChatRef.current();
			openChatRef.current();
		};

		aiChatButton.addEventListener( 'click', handleClick );
		return () => aiChatButton.removeEventListener( 'click', handleClick );
	}, [ sectionName, dismissible, showEntryPoints ] );

	return hasAiChatEntry;
}
