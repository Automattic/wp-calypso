import { createElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, square } from '@wordpress/icons';
import { toggleZoom, isZoomedOut } from '../utils/canvas-zoom';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

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
						pressed: isZoomedOut(),
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
