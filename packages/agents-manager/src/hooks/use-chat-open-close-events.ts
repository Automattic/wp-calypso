import { useEffect, useRef } from '@wordpress/element';
import { takeActionOrigin } from '../utils/action-origin';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';

/** The chat came into view. See `hooks/custom-actions/README.md`. */
export const CHAT_OPENED_EVENT = 'agents-manager-chat-opened';

/** The chat was closed; minimizing is not a close. */
export const CHAT_CLOSED_EVENT = 'agents-manager-chat-closed';

/** What `CHAT_OPENED_EVENT` carries in `detail`. */
export type ChatOpenedDetail = {
	/** The chat was already open when the page loaded. */
	restored: boolean;
	/** `restored`, `host` when opened through the actions bridge, otherwise `user`. */
	trigger: string;
};

/** What `CHAT_CLOSED_EVENT` carries in `detail`. */
export type ChatClosedDetail = {
	/** `host` when closed through the actions bridge, otherwise `user`. */
	trigger: string;
};

interface Options {
	chatIsOpen: boolean;
	isPersistedOpen: boolean;
	isDocked: boolean;
}

/**
 * Records chat opens and closes in Tracks and broadcasts them on `window`, so
 * host bundles can react to the user's own close (e.g. pointing at the
 * entry button) without reading the store or guessing from minimize.
 *
 * Mounted with the dock rather than the entry buttons: the dock renders only
 * once the providers have loaded, so a provider's listener hears the restored
 * open too, and `provider_ids` is always set on the Tracks event.
 * @param options
 * @param options.chatIsOpen      Whether the chat is showing: open and not minimized.
 * @param options.isPersistedOpen The stored open state, which minimizing leaves untouched.
 * @param options.isDocked        Whether the chat is docked, recorded on the close.
 */
export function useChatOpenCloseEvents( { chatIsOpen, isPersistedOpen, isDocked }: Options ): void {
	const wasChatOpenRef = useRef< boolean | null >( null );
	useEffect( () => {
		const wasChatOpen = wasChatOpenRef.current;
		wasChatOpenRef.current = chatIsOpen;
		if ( chatIsOpen && wasChatOpen !== true ) {
			const restored = wasChatOpen === null;
			// Always take, even on restore: a leftover host mark must not
			// label the next merchant open.
			const origin = takeActionOrigin( 'open' );
			const detail: ChatOpenedDetail = { restored, trigger: restored ? 'restored' : origin };
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_opened', detail );
			window.dispatchEvent( new CustomEvent( CHAT_OPENED_EVENT, { detail } ) );
		}
	}, [ chatIsOpen ] );

	// The unified counterpart of Big Sky's two close events (`sidebar_close_click`
	// docked, `dock_back_button_click` floating), so a close stays visible once
	// those names stop firing. Watches the persisted state, not `chatIsOpen`:
	// minimizing hides the chat without closing it and has its own event.
	const wasPersistedOpenRef = useRef< boolean | null >( null );
	useEffect( () => {
		const wasPersistedOpen = wasPersistedOpenRef.current;
		wasPersistedOpenRef.current = isPersistedOpen;
		if ( ! isPersistedOpen && wasPersistedOpen === true ) {
			const detail: ChatClosedDetail = { trigger: takeActionOrigin( 'close' ) };
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_closed', {
				docked: isDocked,
				...detail,
			} );
			window.dispatchEvent( new CustomEvent( CHAT_CLOSED_EVENT, { detail } ) );
		}
	}, [ isPersistedOpen, isDocked ] );
}
