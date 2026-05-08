/**
 * Tracking helpers for the Review Mediation Tracks events.
 */

import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';

const TRACKS_PREFIX = 'jetpack';

function recordTracksEvent(
	eventName: string,
	properties: Record< string, string | number | boolean > = {}
): void {
	recordTracksEventBase( `${ TRACKS_PREFIX }_${ eventName }`, properties );
}

interface TrackReviewMediationSuggestionRenderedOptions {
	postId?: number;
	postType?: string;
}

interface TrackReviewMediationSuggestionClickOptions {
	runId: string;
	trigger: 'suggestion' | 'typed_prompt';
	postId?: number;
	postType?: string;
}

interface TrackReviewMediationResultRenderedOptions {
	outcome: 'success' | 'cache_hit' | 'empty_notes';
	cacheHit: boolean;
	conflictCount: number;
	suggestedEditCount: number;
	autoSuggestedEditCount: number;
	manualSuggestedEditCount: number;
	guidelineViolationCount: number;
	postId?: number;
	runId?: string;
}

interface TrackReviewMediationItemActionOptions {
	action: 'accept' | 'undo' | 'dismiss' | 'bulk_accept' | 'focus';
	target: 'edit' | 'conflict';
	postId?: number;
	runId?: string;
	blockIndex?: number | null;
}

interface TrackReviewMediationErrorOptions {
	errorPhase: 'load' | 'render' | 'apply' | 'undo' | 'network';
	errorType: string;
	postId?: number;
	runId?: string;
}

/**
 * Tracks the empty-view "Mediate review notes" suggestion appearing.
 * @param options          - Tracking options
 * @param options.postId   - (optional) Post ID
 * @param options.postType - (optional) Post type
 */
export function trackReviewMediationSuggestionRendered( {
	postId,
	postType,
}: TrackReviewMediationSuggestionRenderedOptions ): void {
	const properties: Record< string, string | number | boolean > = {};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( postType !== undefined ) {
		properties.post_type = postType;
	}
	recordTracksEvent( 'ai_review_mediation_suggestion_rendered', properties );
}

/**
 * Tracks a user clicking the "Mediate review notes" suggestion.
 * @param options          - Tracking options
 * @param options.runId    - Run id generated at click time, threaded through downstream events
 * @param options.trigger  - Whether the run was triggered via the suggestion chip or a typed prompt
 * @param options.postId   - (optional) Post ID
 * @param options.postType - (optional) Post type
 */
export function trackReviewMediationSuggestionClick( {
	runId,
	trigger,
	postId,
	postType,
}: TrackReviewMediationSuggestionClickOptions ): void {
	const properties: Record< string, string | number | boolean > = {
		run_id: runId,
		trigger,
	};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( postType !== undefined ) {
		properties.post_type = postType;
	}
	recordTracksEvent( 'ai_review_mediation_suggestion_click', properties );
}

/**
 * Tracks the mediation card mounting and becoming visible to the user.
 * @param options                          - Tracking options
 * @param options.outcome                  - High-level outcome: success, cache_hit, or empty_notes
 * @param options.cacheHit                 - Whether the server short-circuited via the state-hash cache
 * @param options.conflictCount            - Number of conflict items in the payload
 * @param options.suggestedEditCount       - Total number of suggested edits
 * @param options.autoSuggestedEditCount   - Suggested edits eligible for one-click apply
 * @param options.manualSuggestedEditCount - Suggested edits requiring manual application
 * @param options.guidelineViolationCount  - Number of guideline violations in the payload
 * @param options.postId                   - (optional) Post ID
 * @param options.runId                    - (optional) Run id threaded from the click event
 */
export function trackReviewMediationResultRendered( {
	outcome,
	cacheHit,
	conflictCount,
	suggestedEditCount,
	autoSuggestedEditCount,
	manualSuggestedEditCount,
	guidelineViolationCount,
	postId,
	runId,
}: TrackReviewMediationResultRenderedOptions ): void {
	const properties: Record< string, string | number | boolean > = {
		outcome,
		cache_hit: cacheHit,
		conflict_count: conflictCount,
		suggested_edit_count: suggestedEditCount,
		auto_suggested_edit_count: autoSuggestedEditCount,
		manual_suggested_edit_count: manualSuggestedEditCount,
		guideline_violation_count: guidelineViolationCount,
	};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( runId !== undefined ) {
		properties.run_id = runId;
	}
	recordTracksEvent( 'ai_review_mediation_result_rendered', properties );
}

/**
 * Tracks a user action on a mediation row (accept, undo, dismiss, bulk-accept, focus).
 * @param options            - Tracking options
 * @param options.action     - Action verb
 * @param options.target     - Whether the row is a suggested edit or a conflict candidate
 * @param options.postId     - (optional) Post ID
 * @param options.runId      - (optional) Run id from the originating click
 * @param options.blockIndex - (optional) Block index for the row's target block
 */
export function trackReviewMediationItemAction( {
	action,
	target,
	postId,
	runId,
	blockIndex,
}: TrackReviewMediationItemActionOptions ): void {
	const properties: Record< string, string | number | boolean > = {
		action,
		target,
	};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( runId !== undefined ) {
		properties.run_id = runId;
	}
	if ( blockIndex !== undefined && blockIndex !== null ) {
		properties.block_index = blockIndex;
	}
	recordTracksEvent( 'ai_review_mediation_item_action', properties );
}

/**
 * Tracks a Review Mediation failure (load, render, apply, undo, or network).
 * @param options            - Tracking options
 * @param options.errorPhase - Which step failed
 * @param options.errorType  - A short error code or message tag
 * @param options.postId     - (optional) Post ID
 * @param options.runId      - (optional) Run id when the failure is tied to a specific invocation
 */
export function trackReviewMediationError( {
	errorPhase,
	errorType,
	postId,
	runId,
}: TrackReviewMediationErrorOptions ): void {
	const properties: Record< string, string | number | boolean > = {
		error_phase: errorPhase,
		error_type: errorType,
	};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( runId !== undefined ) {
		properties.run_id = runId;
	}
	recordTracksEvent( 'ai_review_mediation_error', properties );
}
