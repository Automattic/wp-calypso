import { BigSkyLogo } from '@automattic/components';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Component, useSyncExternalStore } from '@wordpress/element';
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

// Agents Manager broadcasts this on open/close; the new value rides in
// `event.detail.isVisible`. Mirrors `CHAT_VISIBILITY_EVENT` in
// `@automattic/agents-manager` — duplicated to stay decoupled across bundles.
const CHAT_VISIBILITY_EVENT = 'agents-manager-chat-visibility-changed';

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
 * Chat visibility as a single shared store. The toolbar HOC wraps every block,
 * so one store with one pair of window listeners feeds every button — versus a
 * window listener per block. Consumed via `useSyncExternalStore`.
 */
const chatVisibilityStore = ( () => {
	let isVisible = false;
	let hasSeeded = false;
	const listeners = new Set< () => void >();

	const update = ( next: boolean ) => {
		if ( next === isVisible ) {
			return;
		}
		isVisible = next;
		listeners.forEach( ( listener ) => listener() );
	};

	// `agents-manager-ready` and the first subscribe read the (now stable) API.
	const syncFromActions = () => update( isAgentsManagerChatVisible() );

	// Read from the detail, never `isChatVisible()`: the API is refreshed a beat
	// after this event fires, so re-reading it here yields the previous value.
	const syncFromEvent = ( event: Event ) =>
		update( Boolean( ( event as CustomEvent< { isVisible?: boolean } > ).detail?.isVisible ) );

	return {
		subscribe( listener: () => void ): () => void {
			if ( listeners.size === 0 ) {
				window.addEventListener( 'agents-manager-ready', syncFromActions );
				window.addEventListener( CHAT_VISIBILITY_EVENT, syncFromEvent );
				// Reconcile in case the chat opened before the first button mounted.
				syncFromActions();
			}
			listeners.add( listener );

			return () => {
				listeners.delete( listener );
				if ( listeners.size === 0 ) {
					window.removeEventListener( 'agents-manager-ready', syncFromActions );
					window.removeEventListener( CHAT_VISIBILITY_EVENT, syncFromEvent );
				}
			};
		},
		getSnapshot(): boolean {
			// Seed once from live state so an already-open chat paints pressed on
			// first render; stay cached afterward so the snapshot is stable.
			if ( ! hasSeeded ) {
				hasSeeded = true;
				isVisible = isAgentsManagerChatVisible();
			}
			return isVisible;
		},
	};
} )();

function useAgentsManagerChatVisible(): boolean {
	return useSyncExternalStore( chatVisibilityStore.subscribe, chatVisibilityStore.getSnapshot );
}

function handleAgentsManagerReady() {
	isWaitingForAgentsManagerReady = false;
	// Just became ready, so the chat can't already be open — open it.
	( window as WindowWithAgentsManagerActions ).__agentsManagerActions?.setChatOpen?.( true );
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
