/**
 * Tracking helpers for AI Editorial Review Tracks events.
 */

import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';

const TRACKS_PREFIX = 'jetpack';

type TrackProperties = Record< string, string | number | boolean >;

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		getSessionId?: () => unknown;
	};
};

function getSessionId(): string | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	const agentsManagerActions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	const sessionId = agentsManagerActions?.getSessionId?.();
	return typeof sessionId === 'string' && sessionId !== '' ? sessionId : undefined;
}

function recordTracksEvent( eventName: string, properties: TrackProperties = {} ): void {
	const sessionId = getSessionId();
	recordTracksEventBase( `${ TRACKS_PREFIX }_${ eventName }`, {
		...properties,
		...( sessionId ? { sessionid: sessionId } : {} ),
	} );
}

export type ReviewContext =
	| 'notes_and_guidelines'
	| 'notes_only'
	| 'guidelines_only'
	| 'content_only'
	| 'insufficient_input';

interface TrackAiEditorialReviewResultRenderedOptions {
	outcome: 'success' | 'cache_hit' | 'no_findings' | 'insufficient_input';
	conflictCount: number;
	implicationCount: number;
	suggestedEditCount: number;
	guidelineViolationCount: number;
	reviewContext?: ReviewContext;
}

interface TrackAiEditorialReviewItemActionOptions {
	action: 'accept' | 'undo' | 'dismiss' | 'bulk_accept';
	target: 'edit' | 'conflict' | 'mixed';
	outcome: 'success' | 'failed' | 'partial_failed';
	itemCount?: number;
}

export type BlockTransformationSuggestionType = 'text' | 'image';

interface TrackBlockTransformationSuggestionOptions {
	suggestionId: string;
	suggestionType: BlockTransformationSuggestionType;
	blockType: string;
	/** Dropdown option chosen (e.g. tone/language), when the click came from one. */
	optionId?: string;
}

/**
 * Tracks the empty-view "AI Editorial Review" suggestion appearing.
 */
export function trackAiEditorialReviewSuggestionRendered(): void {
	recordTracksEvent( 'ai_editorial_review_suggestion_rendered' );
}

/**
 * Tracks a user clicking the "AI Editorial Review" suggestion.
 */
export function trackAiEditorialReviewSuggestionClick(): void {
	recordTracksEvent( 'ai_editorial_review_suggestion_click' );
}

/**
 * Tracks a block transformation suggestion appearing for a selected block.
 * @param options                - Tracking options
 * @param options.suggestionId   - Stable suggestion identifier.
 * @param options.suggestionType - Transformation category.
 * @param options.blockType      - Core block type the suggestion applies to.
 */
export function trackBlockTransformationSuggestionRendered( {
	suggestionId,
	suggestionType,
	blockType,
}: TrackBlockTransformationSuggestionOptions ): void {
	recordTracksEvent( 'ai_block_transformation_suggestion_rendered', {
		suggestion_id: suggestionId,
		suggestion_type: suggestionType,
		block_type: blockType,
		surface: 'jetpack_ai_sidebar',
	} );
}

/**
 * Tracks a user clicking a block transformation suggestion.
 * @param options                - Tracking options
 * @param options.suggestionId   - Stable suggestion identifier.
 * @param options.suggestionType - Transformation category.
 * @param options.blockType      - Core block type the suggestion applies to.
 * @param options.optionId       - Dropdown option chosen (tone/language), if any.
 */
export function trackBlockTransformationSuggestionClick( {
	suggestionId,
	suggestionType,
	blockType,
	optionId,
}: TrackBlockTransformationSuggestionOptions ): void {
	recordTracksEvent( 'ai_block_transformation_suggestion_click', {
		suggestion_id: suggestionId,
		suggestion_type: suggestionType,
		block_type: blockType,
		surface: 'jetpack_ai_sidebar',
		...( optionId ? { option_id: optionId } : {} ),
	} );
}

/**
 * Tracks the review card mounting and becoming visible to the user.
 * @param options                          - Tracking options
 * @param options.outcome                  - High-level outcome: success, cache_hit, no_findings, or insufficient_input
 * @param options.conflictCount            - Number of conflict items in the payload
 * @param options.implicationCount         - Number of implication items in the payload
 * @param options.suggestedEditCount       - Total number of suggested edits
 * @param options.guidelineViolationCount  - Number of guideline violations in the payload
 * @param options.reviewContext            - Server-selected context used for this review
 */
export function trackAiEditorialReviewResultRendered( {
	outcome,
	conflictCount,
	implicationCount,
	suggestedEditCount,
	guidelineViolationCount,
	reviewContext,
}: TrackAiEditorialReviewResultRenderedOptions ): void {
	const properties: TrackProperties = {
		outcome,
		conflict_count: conflictCount,
		implication_count: implicationCount,
		suggested_edit_count: suggestedEditCount,
		guideline_violation_count: guidelineViolationCount,
	};
	if ( reviewContext !== undefined ) {
		properties.review_context = reviewContext;
	}
	recordTracksEvent( 'ai_editorial_review_result_rendered', properties );
}

/**
 * Tracks a user action on an AI Editorial Review row.
 * @param options                - Tracking options
 * @param options.action         - Action verb
 * @param options.target         - Suggested edit, conflict, or mixed bulk action
 * @param options.outcome        - Whether the action completed successfully
 * @param options.itemCount      - (optional) Number of items attempted
 */
export function trackAiEditorialReviewItemAction( {
	action,
	target,
	outcome,
	itemCount,
}: TrackAiEditorialReviewItemActionOptions ): void {
	const properties: TrackProperties = {
		action,
		target,
		outcome,
	};
	if ( itemCount !== undefined ) {
		properties.item_count = itemCount;
	}
	recordTracksEvent( 'ai_editorial_review_item_action', properties );
}
