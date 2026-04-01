import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { createElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, square } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

// Opt-in to private APIs to access zoom-level dispatchers.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/edit-site'
);

function isZoomedOut(): boolean {
	return unlock( select( blockEditorStore ) ).isZoomOut();
}

function toggleZoom(): void {
	const { setZoomLevel, resetZoomLevel } = unlock( dispatch( blockEditorStore ) );
	const { __unstableSetEditorMode } = dispatch( blockEditorStore );

	if ( isZoomedOut() ) {
		resetZoomLevel();
		__unstableSetEditorMode( 'edit' );
	} else {
		setZoomLevel( 0.5 );
		__unstableSetEditorMode( 'zoom-out' );
	}
}

/**
 * Registers a zoom toggle action on `show_component` agent messages.
 * Toggles the Gutenberg editor canvas between default and zoom-out mode.
 */
export default function useZoomAction( registerMessageActions: RegisterMessageActions ): void {
	useEffect( () => {
		registerMessageActions( {
			id: 'agents-manager-zoom',
			actions: ( message: UIMessage ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}

				// Only show zoom on `show_component` tool messages.
				const firstPartText = message.content?.[ 0 ]?.text ?? '';
				try {
					const parsed = JSON.parse( firstPartText );
					if ( parsed.tool_id !== 'big_sky__show_component' ) {
						return [];
					}
				} catch {
					return [];
				}

				return [
					{
						id: 'zoom-toggle',
						label: __( 'Toggle zoom', '__i18n_text_domain__' ),
						icon: createElement( Icon, {
							icon: square,
							className: 'agents-manager-message-action-icon',
						} ),
						onClick: toggleZoom,
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
