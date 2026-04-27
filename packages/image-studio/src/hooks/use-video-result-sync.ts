import { getAgentManager } from '@automattic/agenttic-client';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { type VideoStudioActions, store as videoStudioStore } from '../stores/video-studio';

// The wpcom video-generation tool. The server tool registry exposes both a
// slash-namespaced and double-underscore-namespaced form depending on which
// surface streamed the part — match either.
const VIDEO_TOOL_IDS = new Set( [
	'wpcom/generate-video-for-studio',
	'wpcom__generate_video_for_studio',
] );

interface AgentMessageLike {
	id?: string;
	role?: string;
}

interface RawPart {
	type?: string;
	data?: Record< string, unknown >;
}

interface RawMessage {
	role?: string;
	parts?: RawPart[];
	messageId?: string;
}

/**
 * Watches the agent message stream for a successful
 * `generate-video-for-studio` tool result and lifts the rendered MP4 URL into
 * the video studio store so the canvas can play it. Only the most recent
 * successful result wins.
 *
 * Why agent-manager (not the `messages` array)? The agenttic-client UI message
 * formatter (`buildUIMessage`) drops any agent message whose parts include
 * tool data — so `useAgentChat().messages` never carries the URL we need. The
 * raw conversation history kept by the agent manager DOES preserve those
 * `ToolResultDataPart` entries, so we read from there. We still depend on the
 * UI `messages` array as a re-render signal — when a new agent text message
 * arrives after a tool runs, the array changes and we re-scan.
 * @param messages - UI messages from `useAgentChat`, used as a change signal.
 * @param agentId  - The agent ID registered in the agent manager.
 */
export function useVideoResultSync( messages?: Array< AgentMessageLike >, agentId?: string ) {
	const lastHandledUrl = useRef< string | null >( null );

	// Dispatch into the dedicated video-studio store. Older bundles never
	// registered this store, so there's no race to worry about.
	const dispatchActions = useDispatch( videoStudioStore ) as Partial< VideoStudioActions >;
	const setCurrentVideoUrl = dispatchActions.setCurrentVideoUrl;

	useEffect( () => {
		if ( ! setCurrentVideoUrl || ! agentId ) {
			return;
		}

		let history: RawMessage[] = [];
		try {
			const manager = getAgentManager();
			if ( ! manager.hasAgent( agentId ) ) {
				return;
			}
			history = manager.getConversationHistory( agentId ) as RawMessage[];
		} catch {
			// Agent manager throws if the agent isn't registered yet — bail.
			return;
		}

		if ( ! history.length ) {
			return;
		}

		// Walk newest-first; the most recent successful video result wins.
		for ( let i = history.length - 1; i >= 0; i-- ) {
			const url = extractVideoUrlFromParts( history[ i ]?.parts );
			if ( url ) {
				if ( url === lastHandledUrl.current ) {
					return;
				}
				lastHandledUrl.current = url;
				setCurrentVideoUrl( url );
				return;
			}
		}
		// `messages` is intentionally a dependency: each time a new UI message
		// lands (including the agent's "video has been generated" text), we
		// re-scan the raw history for the matching tool result.
	}, [ messages, agentId, setCurrentVideoUrl ] );
}

function extractVideoUrlFromParts( parts?: RawPart[] ): string | null {
	if ( ! parts?.length ) {
		return null;
	}
	for ( const part of parts ) {
		if ( part?.type !== 'data' ) {
			continue;
		}
		const data = part.data as
			| { toolId?: string; result?: { url?: string; attachmentId?: number } }
			| undefined;
		if ( ! data || typeof data.toolId !== 'string' || ! VIDEO_TOOL_IDS.has( data.toolId ) ) {
			continue;
		}
		const result = data.result;
		const attachmentId = result?.attachmentId;
		const url = result?.url;
		if ( typeof url === 'string' && url && typeof attachmentId === 'number' && attachmentId > 0 ) {
			return url;
		}
	}
	return null;
}
