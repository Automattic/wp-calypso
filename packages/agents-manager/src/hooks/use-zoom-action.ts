import { useEffect } from '@wordpress/element';
import ZoomActionButton from '../components/zoom-action-button';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Registers a zoom toggle action on `show_component` agent messages.
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
						type: 'component',
						id: 'zoom-toggle',
						component: ZoomActionButton,
						order: 5,
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
