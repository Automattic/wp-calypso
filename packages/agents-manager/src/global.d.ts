/**
 * Global type declarations for the Agents Manager package.
 */

/**
 * `agentsManagerData` is set as a global const via wp_add_inline_script
 * in Jetpack's Agents Manager feature.
 */
declare const agentsManagerData:
	| {
			agentProviders?: string[];
			useUnifiedExperience?: boolean;
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

/**
 * Public API shape exposed on `window.__agentsManagerActions`.
 */
interface AgentsManagerActions {
	getChatState: () => Promise< AgentsManagerChatState >;
	setChatOpen: ( isOpen: boolean ) => void;
	setChatDocked: ( isDocked: boolean ) => void;
	setChatEnabled: ( isEnabled: boolean ) => void;
	setChatCompactMode: ( isCompact: boolean ) => void;
	chatNavigate: import('react-router-dom').NavigateFunction;
}

/**
 * Extend Window interface for cross-bundle data sharing.
 */
interface Window {
	__agentsManagerActions?: AgentsManagerActions;
}
