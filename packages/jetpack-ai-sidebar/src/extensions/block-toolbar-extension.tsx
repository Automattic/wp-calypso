import { BigSkyLogo } from '@automattic/components';
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
								icon={ <BigSkyLogo.CentralLogo fill="currentColor" heartless size={ 20 } /> }
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
