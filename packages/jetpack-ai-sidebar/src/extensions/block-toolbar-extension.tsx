import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isBlockToolbarButtonEnabled } from '../utils/preview-features';
import type { ComponentType } from 'react';

type BlockEditProps = {
	name: string;
	[ key: string ]: unknown;
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		isReady?: boolean;
		setChatOpen?: ( isOpen: boolean ) => void;
		isChatVisible?: () => boolean;
	};
};

// Agents Manager registers this store on the shared `wp.data` registry; the
// sidebar bundle already dispatches to it (see `index.ts`). We read it for the
// reactive pressed state, and drive open/close through `__agentsManagerActions`
// (below), which also handles dock/minimize layout.
const AGENTS_MANAGER_STORE = 'automattic/agents-manager';

type AgentsManagerStoreSelectors = {
	getAgentsManagerState: () => { isOpen?: boolean; isMinimized?: boolean };
};

function JetpackAiToolbarIcon() {
	return (
		<svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20">
			<path
				fill="currentColor"
				d="m19.223 11.55-3.095-1.068a4.21 4.21 0 0 1-2.61-2.61L12.45 4.777c-.145-.426-.755-.426-.9 0l-1.068 3.095a4.21 4.21 0 0 1-2.61 2.61L4.777 11.55c-.426.145-.426.755 0 .9l3.095 1.068a4.21 4.21 0 0 1 2.61 2.61l1.068 3.095c.145.426.755.426.9 0l1.068-3.095a4.21 4.21 0 0 1 2.61-2.61l3.095-1.068c.426-.145.426-.755 0-.9Zm-3.613.68-1.547.533a2.105 2.105 0 0 0-1.306 1.305l-.533 1.548a.24.24 0 0 1-.453 0l-.534-1.548a2.105 2.105 0 0 0-1.305-1.305l-1.548-.534a.24.24 0 0 1 0-.453l1.548-.534a2.105 2.105 0 0 0 1.305-1.305l.534-1.547a.24.24 0 0 1 .453 0l.534 1.547c.21.615.695 1.095 1.305 1.305l1.547.534a.24.24 0 0 1 0 .453Z"
			/>
		</svg>
	);
}

let isWaitingForAgentsManagerReady = false;

function isAgentsManagerChatVisible(): boolean {
	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	return actions?.isChatVisible?.() ?? false;
}

function toggleAgentsManagerChat() {
	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;

	// Toggle open/closed without reshaping the chat's docked/floating layout.
	actions?.setChatOpen?.( ! isAgentsManagerChatVisible() );
}

/**
 * Whether the chat is on screen (open and not minimized), tracked reactively so
 * the toolbar button reflects a pressed state. Reads the shared Agents Manager
 * store; returns `false` until that store is registered.
 */
function useAgentsManagerChatVisible(): boolean {
	return useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerStoreSelectors | undefined;
		if ( ! store?.getAgentsManagerState ) {
			return false;
		}
		const { isOpen, isMinimized } = store.getAgentsManagerState();
		return Boolean( isOpen ) && ! isMinimized;
	}, [] );
}

function handleAgentsManagerReady() {
	isWaitingForAgentsManagerReady = false;
	// Apply the queued click as a toggle, so it stays correct however the chat
	// loaded.
	toggleAgentsManagerChat();
}

export function toggleJetpackAiSidebarChat(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	if ( actions?.isReady ) {
		toggleAgentsManagerChat();
		return;
	}

	if ( isWaitingForAgentsManagerReady ) {
		return;
	}

	isWaitingForAgentsManagerReady = true;
	window.addEventListener( 'agents-manager-ready', handleAgentsManagerReady, { once: true } );
}

/**
 * Add Jetpack AI button to block toolbars.
 */
export const withJetpackAiToolbarButton = createHigherOrderComponent(
	( BlockEdit: ComponentType< BlockEditProps > ) => {
		const JetpackAiToolbarButtonInner = ( props: BlockEditProps ) => {
			const isChatVisible = useAgentsManagerChatVisible();

			if ( ! isBlockToolbarButtonEnabled() ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<>
					<BlockEdit { ...props } />
					<BlockControls group="default">
						<ToolbarGroup>
							<ToolbarButton
								icon={ <JetpackAiToolbarIcon /> }
								label={ __( 'Ask AI', __i18n_text_domain__ ) }
								isPressed={ isChatVisible }
								onClick={ toggleJetpackAiSidebarChat }
							/>
						</ToolbarGroup>
					</BlockControls>
				</>
			);
		};

		// Class wrapper ensures compatibility with plugins that use
		// `class extends` on editor filter results (e.g. AMP plugin).
		// Arrow functions have no [[Construct]], so `class extends arrowFn` throws.
		class JetpackAiToolbarButton extends Component< BlockEditProps > {
			render() {
				return <JetpackAiToolbarButtonInner { ...this.props } />;
			}
		}

		return JetpackAiToolbarButton;
	},
	'withJetpackAiToolbarButton'
);
