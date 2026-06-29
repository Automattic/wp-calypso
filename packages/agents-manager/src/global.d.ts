/**
 * Global type declarations for the Agents Manager package.
 */

/**
 * `agentsManagerData` is set as a global const via wp_add_inline_script
 * in Jetpack's Agents Manager feature.
 *
 * `agentProviders` entries may be URL strings (dynamically imported as ES
 * modules), URL metadata objects, or already-loaded `LoadedProviders` objects
 * with the same shape.
 */
declare const agentsManagerData:
	| {
			agentProviders?: import('./utils/load-external-providers').AgentProviderEntry[];
			useUnifiedExperience?: boolean;
			agentId?: string;
			helpCenterUrl?: string;
			/** Dev/internal context (localhost, jurassic, proxied a11ns, internal Atomic). Drives `is_test`. */
			isDevMode?: boolean;
			emptyViewHeading?: string;
			emptyViewHelp?: string;
	  }
	| undefined;

declare module '@wordpress/block-editor' {
	import type { StoreDescriptor } from '@wordpress/data';
	interface BlockEditorSelectors {
		getSelectedBlock(): {
			name: string;
			attributes?: {
				content?: {
					text?: string;
				};
			};
		} | null;
	}

	interface BlockEditorActions {
		clearSelectedBlock(): void;
	}

	export const store: StoreDescriptor< BlockEditorSelectors, BlockEditorActions >;
	export const BlockIcon: React.ComponentType< { icon: unknown } >;
}

/**
 * Chat state returned by `getChatState()`.
 */
interface AgentsManagerChatState {
	isOpen: boolean;
	isDocked: boolean;
	floatingPosition: string;
}

type AgentsManagerExternalContextDelivery = 'next-message' | 'conversation';

interface AgentsManagerExternalContextEntry {
	id: string;
	type?: string;
	source?: string;
	title?: string;
	description?: string;
	data?: unknown;
	delivery?: AgentsManagerExternalContextDelivery;
	createdAt?: string;
}

interface AgentsManagerExternalContextCardAction {
	id?: string;
	label: string;
	prompt?: string;
	type?: 'prefill' | 'submit';
}

interface AgentsManagerExternalContextCard {
	id: string;
	/**
	 * IDs of context entries linked to this card. Dismissing the card or
	 * consuming any linked entry cleans up both sides. A card may reference
	 * multiple entries when its body aggregates data from several sources.
	 */
	contextEntryIds?: string[];
	/**
	 * Publisher-owned card body. AM renders this inside the card frame
	 * and only adds the dismiss button and actions row.
	 */
	body: import('react').ReactNode;
	actions?: AgentsManagerExternalContextCardAction[];
	createdAt?: string;
}

/**
 * Public API shape exposed on `window.__agentsManagerActions`.
 */
interface AgentsManagerActions {
	getChatState: () => Promise< AgentsManagerChatState >;
	getSessionId: () => string;
	setChatOpen: ( isOpen: boolean ) => void;
	setChatDocked: ( isDocked: boolean ) => void;
	setChatEnabled: ( isEnabled: boolean ) => void;
	setChatCompactMode: ( isCompact: boolean ) => void;
	setChatDesktopMediaQuery: ( query: string ) => void;
	setChatInput?: ( value: string ) => void;
	submitChatMessage?: ( message?: string ) => Promise< void >;
	setContextEntry: ( entry: AgentsManagerExternalContextEntry ) => void;
	removeContextEntry: ( id: string ) => void;
	setContextCard: ( card: AgentsManagerExternalContextCard ) => void;
	removeContextCard: ( id: string ) => void;
	setSiteEditorAction: ( name: string, value: string | number | boolean | null ) => void;
	chatNavigate: import('react-router-dom').NavigateFunction;
	resumeChat: () => void;
	isChatVisible: () => boolean;
	getCurrentRoute: () => string;
	isCompactMode?: boolean;
	isChatEnabled?: boolean;
	desktopMediaQuery?: string;
	/**
	 * Set to `true` once the actions API is fully populated and safe to call.
	 * Hosts that load after Agents Manager can check this flag synchronously
	 * instead of waiting for the `agents-manager-ready` event.
	 */
	isReady?: boolean;
}

/**
 * Extend Window interface for cross-bundle data sharing.
 */
interface Window {
	__agentsManagerActions?: AgentsManagerActions;
	/** Big Sky injects this on editor surfaces. Narrowed to the fields AM consumes. */
	bigSkyInitialState?: {
		bigSkyVersion?: string;
		isFreeTrial?: string;
		isDevMode?: string;
		currentScreen?: { screen?: string };
	};
}
