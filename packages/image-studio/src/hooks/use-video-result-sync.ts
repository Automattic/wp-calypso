import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';

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
 * into the Image Studio store so the canvas can play it. Only the most recent
 * successful result wins.
 */
export function useVideoResultSync( messages?: Array< AgentMessageWithParts > ) {
	const lastHandledMessageId = useRef< string | null >( null );

	// Older registered bundles (multi-bundle case) may not expose this action;
	// guard the read so an undefined dispatcher cannot crash the hook.
	const dispatchActions = useDispatch( imageStudioStore ) as Partial< ImageStudioActions >;
	const setImageStudioCurrentVideoUrl = dispatchActions.setImageStudioCurrentVideoUrl;

	useEffect( () => {
		if ( ! messages?.length || ! setImageStudioCurrentVideoUrl ) {
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
				setImageStudioCurrentVideoUrl( url );
				return;
			}
		}
	}, [ messages, setImageStudioCurrentVideoUrl ] );
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
