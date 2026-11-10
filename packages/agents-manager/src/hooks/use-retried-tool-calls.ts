import { useCallback, useMemo, useState } from '@wordpress/element';
import { getRetryingToolCallId } from '../utils/tool-message-utils';
import type { TaskUpdate } from '@automattic/agenttic-client';

interface RetriedToolCalls {
	streamGeneration?: symbol;
	ids: ReadonlySet< string >;
}

/**
 * Collects the block-edit tool calls the server replaced with a retry, so their
 * interim "No changes needed" outcome is hidden.
 *
 * Tool-call ids are only unique within a transcript, so retries are tagged with
 * the stream generation, which survives a new chat's session ID bootstrap
 * (`isSessionBootstrap()`) but changes with any other session switch.
 */
export function useRetriedToolCalls( streamGeneration: symbol ) {
	const [ retriedToolCalls, setRetriedToolCalls ] = useState< RetriedToolCalls >( {
		ids: new Set(),
	} );

	const retriedToolCallIds = useMemo(
		() =>
			retriedToolCalls.streamGeneration === streamGeneration
				? retriedToolCalls.ids
				: new Set< string >(),
		[ retriedToolCalls, streamGeneration ]
	);

	const recordRetriedToolCall = useCallback(
		( update: TaskUpdate ) => {
			const retryingToolCallId = getRetryingToolCallId( update.status?.message );
			if ( ! retryingToolCallId ) {
				return;
			}

			setRetriedToolCalls( ( previous ) => {
				if ( previous.streamGeneration !== streamGeneration ) {
					return { streamGeneration, ids: new Set( [ retryingToolCallId ] ) };
				}

				return previous.ids.has( retryingToolCallId )
					? previous
					: { ...previous, ids: new Set( [ ...previous.ids, retryingToolCallId ] ) };
			} );
		},
		[ streamGeneration ]
	);

	return { retriedToolCallIds, recordRetriedToolCall };
}
