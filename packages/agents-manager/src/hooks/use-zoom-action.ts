import { useEffect } from '@wordpress/element';
import ZoomActionButton from '../components/zoom-action-button';
import { isEditorPage } from '../utils/is-editor-page';
import { isShowComponentTool } from '../utils/show-component-tools';
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
				if ( message.role !== 'agent' || ! isEditorPage() ) {
					return [];
				}

				// Only show zoom on `show_component` tool messages, and let
				// individual component types opt out via `data.hideZoomAction`
				// (e.g. title-picker doesn't need canvas zoom — it edits the
				// post title, not block content).
				const firstPartText = message.content?.[ 0 ]?.text ?? '';
				try {
					const parsed = JSON.parse( firstPartText );
					if ( ! isShowComponentTool( parsed.tool_id ) ) {
						return [];
					}
					if ( parsed.data?.hideZoomAction ) {
						return [];
					}
				} catch {
					return [];
				}

				return [
					{
						type: 'component',
						id: 'zoom',
						component: ZoomActionButton,
						order: 5,
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
