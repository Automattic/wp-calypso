import { useEffect, useRef } from '@wordpress/element';
import { recordBigSkyTracksEvent } from '../utils/tracks';

interface ChatResponseRenderedTrackerProps {
	componentType: string;
	toolId: string;
	toolCallId?: string;
	responseTrackingProperties?: unknown;
}

const RESPONSE_COUNT_PROPERTIES = [
	'suggested_edit_count',
	'conflict_count',
	'implication_count',
	'guideline_violation_count',
] as const;

const REVIEW_CONTEXTS = new Set( [
	'notes_and_guidelines',
	'notes_only',
	'guidelines_only',
	'content_only',
	'insufficient_input',
] );

/** Keeps only supported response properties with valid values. */
function getResponseTrackingProperties( value: unknown ): Record< string, string | number > {
	if ( typeof value !== 'object' || value === null ) {
		return {};
	}

	const properties = value as Record< string, unknown >;
	const safeProperties = RESPONSE_COUNT_PROPERTIES.reduce< Record< string, string | number > >(
		( result, property ) => {
			const count = properties[ property ];
			if ( typeof count === 'number' && Number.isSafeInteger( count ) && count >= 0 ) {
				result[ property ] = count;
			}
			return result;
		},
		{}
	);
	const reviewContext = properties.review_context;
	if ( typeof reviewContext === 'string' && REVIEW_CONTEXTS.has( reviewContext ) ) {
		safeProperties.review_context = reviewContext;
	}

	return safeProperties;
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
	responseTrackingProperties,
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
			...getResponseTrackingProperties( responseTrackingProperties ),
		} );
	}, [ componentType, responseKey, responseTrackingProperties, toolCallId, toolId ] );

	return null;
}
