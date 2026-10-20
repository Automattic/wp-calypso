import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAgentsManagerContext } from '../contexts';
import {
	blockCurrentRequest,
	buildCanvasKey,
	getCanvasMove,
	isCanvasWritingAgent,
} from '../utils/canvas-binding';
import { generateUUID } from '../utils/generate-uuid';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';

interface UseCanvasMoveAbortOptions {
	isProcessing: boolean;
	abortCurrentRequest: UseAgentChatReturn[ 'abortCurrentRequest' ];
	addMessage: UseAgentChatReturn[ 'addMessage' ];
}

/**
 * Stops a request as soon as the user leaves the canvas it was made for. The
 * guard in `canvas-guard` would refuse the write anyway, but only
 * once the model got there, leaving the user to watch a request run against a
 * page they already left.
 *
 * Reads the editor store, not a host event: AM runs in the editor's realm, so
 * `useSelect` is enough. It lands a tick after a synchronous listener would, so
 * `blockCurrentRequest()` is required: the guard is what stops the write.
 */
export function useCanvasMoveAbort( {
	isProcessing,
	abortCurrentRequest,
	addMessage,
}: UseCanvasMoveAbortOptions ) {
	const { agentConfig } = useAgentsManagerContext();
	const agentId = agentConfig?.agentId;

	// Only a trigger for the effect below. Needs the post type as well as the id:
	// a page and a template can share an id, and a move between them must not
	// read as a stay.
	const canvasKey = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as {
			getCurrentPostId?: () => number | string | undefined;
			getCurrentPostType?: () => string | undefined;
		};
		return buildCanvasKey( editor?.getCurrentPostType?.(), editor?.getCurrentPostId?.() );
	}, [] );

	useEffect( () => {
		// Keyed off the live move rather than `getBlockingMove()`: a request already
		// blocked would otherwise abort again on every later canvas change.
		if ( ! isCanvasWritingAgent( agentId ) || ! isProcessing || ! getCanvasMove() ) {
			return;
		}

		// Blocked as well as aborted: an abort that loses the race to an in-flight
		// tool call must not let that call land on the new page.
		blockCurrentRequest();
		abortCurrentRequest();

		recordAgentsManagerTracksEvent( 'calypso_agents_manager_editor_canvas_move_request_aborted', {
			agent_id: agentId,
		} );

		// Say why, or the reply stops mid-sentence and reads as a failure. Its id
		// is not in the agent's client history, so `filterUiOnlyMessages` keeps it
		// on screen and it is never sent to the server as history.
		addMessage( {
			id: `canvas-move-abort-${ generateUUID() }`,
			role: 'agent',
			content: [
				{
					type: 'text',
					text: __(
						'You navigated away from that page, so I stopped the request before it changed the wrong one. Open the page you want and ask again.',
						__i18n_text_domain__
					),
				},
			],
			timestamp: Date.now(),
			archived: false,
			showIcon: true,
		} );
	}, [ agentId, canvasKey, isProcessing, abortCurrentRequest, addMessage ] );
}
