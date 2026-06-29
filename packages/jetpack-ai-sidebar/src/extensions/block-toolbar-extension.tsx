import { BigSkyLogo } from '@automattic/components';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
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
	};
};

let isWaitingForAgentsManagerReady = false;

function openAgentsManagerChat() {
	const actions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;

	// Open the chat in whatever state the user last left it (docked or
	// floating). The toolbar entry only opens the chat — it never reshapes its
	// layout.
	actions?.setChatOpen?.( true );
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
	( BlockEdit: ComponentType< BlockEditProps > ) => {
		const JetpackAiToolbarButtonInner = ( props: BlockEditProps ) => {
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
