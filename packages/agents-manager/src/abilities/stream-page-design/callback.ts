import { __ } from '@wordpress/i18n';
import { errorResult } from '../ability-result';
import { finalizePendingStreams, STREAM_PAGE_DESIGN_TOOL_ID } from './stream';
import type { AbilityResult } from '../types';

interface StreamPageDesignInput {
	summary?: string;
	toolCallId?: string;
}

/**
 * The `stream-page-design` ability callback. The transport has already
 * painted the design; this call closes the tool round trip, so it finalizes
 * the stream, and reports a design the canvas never took. It writes nothing
 * itself, so no editor guard. `returnToAgent` stays true whatever happened, or
 * the agent hangs waiting for a result.
 */
export async function streamPageDesignCallback(
	input: StreamPageDesignInput | null
): Promise< AbilityResult > {
	const { summary: rawSummary, toolCallId } = input ?? {};

	const finalized = await finalizePendingStreams(
		typeof toolCallId === 'string' ? toolCallId : undefined
	);

	if ( ! finalized ) {
		return errorResult(
			'The editor canvas did not take the page design. Tell the user, and do not retry without asking.',
			__( 'The page design could not be applied to the editor.', __i18n_text_domain__ )
		);
	}

	const summary =
		typeof rawSummary === 'string' && rawSummary.trim()
			? rawSummary.trim()
			: __(
					'The generated page content has been staged in the editor for review.',
					__i18n_text_domain__
				);

	return {
		result: { success: true, message: summary },
		returnToAgent: true,
		// JSON `agentMessage` for `convertToolMessagesToComponents()`, which renders `data.summary`.
		agentMessage: JSON.stringify( {
			tool_id: STREAM_PAGE_DESIGN_TOOL_ID,
			data: { summary, isCurrent: true },
		} ),
	};
}
