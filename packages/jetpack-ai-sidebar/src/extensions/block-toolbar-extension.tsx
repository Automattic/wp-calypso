import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	isBlockToolbarButtonEnabled,
	isBlockTransformationsEnabled,
} from '../utils/preview-features';

type BlockEditProps = {
	name: string;
	[ key: string ]: unknown;
};

type AgentsManagerChatState = {
	isOpen: boolean;
	isDocked: boolean;
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		isReady?: boolean;
		getChatState?: () => Promise< AgentsManagerChatState >;
		setChatOpen?: ( isOpen: boolean ) => void;
		setChatDocked?: ( isDocked: boolean ) => void;
		setChatCompactMode?: ( isCompact: boolean ) => void;
	};
};

let isWaitingForAgentsManagerReady = false;

async function openAgentsManagerChat() {
	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;

	if ( ! actions ) {
		return;
	}

	const chatState = await actions.getChatState?.();

	// The chat is already open (docked or floating). Leave it exactly as the
	// user has it — the toolbar entry only opens the chat from a minimized /
	// floating resting state, it must never reshape an already-open chat.
	if ( chatState?.isOpen ) {
		return;
	}

	// Closed but docked: respect the docked preference and open it docked
	// rather than forcing the floating compact view.
	if ( chatState?.isDocked ) {
		actions.setChatOpen?.( true );
		return;
	}

	// Closed and floating (minimized): open into the compact view.
	if ( actions.setChatCompactMode ) {
		actions.setChatDocked?.( false );
		actions.setChatCompactMode( true );
		actions.setChatOpen?.( false );
		return;
	}

	actions.setChatOpen?.( true );
}

function handleAgentsManagerReady() {
	isWaitingForAgentsManagerReady = false;
	openAgentsManagerChat();
}

export function openJetpackAiSidebarChat(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	if ( actions?.isReady ) {
		openAgentsManagerChat();
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
	( BlockEdit: React.ComponentType< BlockEditProps > ) => {
		const JetpackAiToolbarButtonInner = ( props: BlockEditProps ) => {
			if ( ! isBlockTransformationsEnabled() || ! isBlockToolbarButtonEnabled() ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<>
					<BlockEdit { ...props } />
					<BlockControls group="default">
						<ToolbarGroup>
							<ToolbarButton
								icon={ <BigSkyLogo.CentralLogo fill="currentColor" heartless size={ 20 } /> }
								label={ __( 'Ask Jetpack AI', 'jetpack' ) }
								onClick={ openJetpackAiSidebarChat }
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
