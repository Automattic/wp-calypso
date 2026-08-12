import { useEffect, useRef } from '@wordpress/element';
import { recordBigSkyTracksEvent } from '../utils/tracks';

interface ChatResponseRenderedTrackerProps {
	componentType: string;
	toolId: string;
	toolCallId?: string;
}

export interface ChatResponseAction {
	action: 'accept' | 'bulk_accept' | 'dismiss' | 'undo';
	// Providers own their target vocabulary and should narrow it in their package.
	target: string;
	outcome: 'success' | 'failed' | 'partial_failed';
	itemCount?: number;
}

interface ChatResponseIdentifiers {
	componentType: string;
	toolId: string;
	toolCallId?: string;
}

/** Creates a host callback that records component-local response actions. */
export function createChatResponseActionCallback( {
	componentType,
	toolId,
	toolCallId,
}: ChatResponseIdentifiers ) {
	return ( { action, target, outcome, itemCount }: ChatResponseAction ) => {
		recordBigSkyTracksEvent( 'chat_response_action', {
			component_type: componentType,
			tool_id: toolId,
			...( toolCallId ? { tool_call_id: toolCallId } : {} ),
			action,
			target,
			outcome,
			...( itemCount !== undefined ? { item_count: itemCount } : {} ),
		} );
	};
}

/**
 * Records a live component response after it reaches the rendered message tree.
 */
export default function ChatResponseRenderedTracker( {
	componentType,
	toolId,
	toolCallId,
}: ChatResponseRenderedTrackerProps ) {
	const responseKey = JSON.stringify( [ toolId, toolCallId ?? null, componentType ] );
	const lastTrackedResponseRef = useRef< string | null >( null );

	useEffect( () => {
		if ( lastTrackedResponseRef.current === responseKey ) {
			return;
		}
		lastTrackedResponseRef.current = responseKey;
		recordBigSkyTracksEvent( 'chat_response_rendered', {
			component_type: componentType,
			tool_id: toolId,
			...( toolCallId ? { tool_call_id: toolCallId } : {} ),
		} );
	}, [ componentType, responseKey, toolCallId, toolId ] );

	return null;
}
