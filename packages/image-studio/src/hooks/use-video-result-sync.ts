import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { type VideoStudioActions, store as videoStudioStore } from '../stores/video-studio';

const VIDEO_TOOL_ID = 'wpcom/generate-video-for-studio';

interface AgentMessageWithParts {
	id?: string;
	role?: string;
	parts?: Array< {
		type?: string;
		data?: Record< string, unknown >;
	} >;
}

/**
 * Watches the agent message stream for a successful
 * `wpcom/generate-video-for-studio` tool result and lifts the rendered MP4 URL
 * into the video studio store so the canvas can play it. Only the most recent
 * successful result wins.
 */
export function useVideoResultSync( messages?: Array< AgentMessageWithParts > ) {
	const lastHandledMessageId = useRef< string | null >( null );

	// Dispatch into the dedicated video-studio store. Older bundles never
	// registered this store, so there's no race to worry about.
	const dispatchActions = useDispatch( videoStudioStore ) as Partial< VideoStudioActions >;
	const setCurrentVideoUrl = dispatchActions.setCurrentVideoUrl;

	useEffect( () => {
		if ( ! messages?.length || ! setCurrentVideoUrl ) {
			return;
		}

		// Walk newest-first; bail at the first agent message we've already handled.
		for ( let i = messages.length - 1; i >= 0; i-- ) {
			const message = messages[ i ];
			if ( message.role !== 'agent' ) {
				continue;
			}
			if ( message.id && message.id === lastHandledMessageId.current ) {
				return;
			}
			const url = extractVideoUrlFromParts( message.parts );
			if ( url ) {
				if ( message.id ) {
					lastHandledMessageId.current = message.id;
				}
				setCurrentVideoUrl( url );
				return;
			}
		}
	}, [ messages, setCurrentVideoUrl ] );
}

function extractVideoUrlFromParts(
	parts?: Array< { type?: string; data?: Record< string, unknown > } >
): string | null {
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
		if ( ! data || data.toolId !== VIDEO_TOOL_ID ) {
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
