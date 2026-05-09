/**
 * Tracking helpers for the Review Mediation Tracks events.
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

interface TrackReviewMediationSuggestionClickOptions {
	clientRunId: string;
}

interface TrackReviewMediationResultRenderedOptions {
	outcome: 'success' | 'cache_hit' | 'empty_notes';
	conflictCount: number;
	implicationCount: number;
	suggestedEditCount: number;
	guidelineViolationCount: number;
	clientRunId: string;
}

interface TrackReviewMediationItemActionOptions {
	action: 'accept' | 'undo' | 'dismiss' | 'bulk_accept';
	target: 'edit' | 'conflict' | 'mixed';
	outcome: 'success' | 'failed' | 'partial_failed';
	clientRunId?: string;
	itemCount?: number;
}

interface TrackReviewMediationErrorOptions {
	errorPhase: 'load' | 'render' | 'apply' | 'undo' | 'network';
	errorType: string;
	clientRunId?: string;
}

/**
 * Tracks the empty-view "Mediate review notes" suggestion appearing.
 */
export function trackReviewMediationSuggestionRendered(): void {
	recordTracksEvent( 'ai_review_mediation_suggestion_rendered' );
}

/**
 * Tracks a user clicking the "Mediate review notes" suggestion.
 * @param options             - Tracking options
 * @param options.clientRunId - Client-side join id generated at click time
 */
export function trackReviewMediationSuggestionClick( {
	clientRunId,
}: TrackReviewMediationSuggestionClickOptions ): void {
	const properties: TrackProperties = {
		client_run_id: clientRunId,
	};
	recordTracksEvent( 'ai_review_mediation_suggestion_click', properties );
}

/**
 * Tracks the mediation card mounting and becoming visible to the user.
 * @param options                          - Tracking options
 * @param options.outcome                  - High-level outcome: success, cache_hit, or empty_notes
 * @param options.conflictCount            - Number of conflict items in the payload
 * @param options.implicationCount         - Number of implication items in the payload
 * @param options.suggestedEditCount       - Total number of suggested edits
 * @param options.guidelineViolationCount  - Number of guideline violations in the payload
 * @param options.clientRunId              - Client-side join id for this mediation card
 */
export function trackReviewMediationResultRendered( {
	outcome,
	conflictCount,
	implicationCount,
	suggestedEditCount,
	guidelineViolationCount,
	clientRunId,
}: TrackReviewMediationResultRenderedOptions ): void {
	const properties: TrackProperties = {
		outcome,
		conflict_count: conflictCount,
		implication_count: implicationCount,
		suggested_edit_count: suggestedEditCount,
		guideline_violation_count: guidelineViolationCount,
		client_run_id: clientRunId,
	};
	recordTracksEvent( 'ai_review_mediation_result_rendered', properties );
}

/**
 * Tracks a user action on a mediation row.
 * @param options                - Tracking options
 * @param options.action         - Action verb
 * @param options.target         - Suggested edit, conflict, or mixed bulk action
 * @param options.outcome        - Whether the action completed successfully
 * @param options.clientRunId    - (optional) Client-side join id
 * @param options.itemCount      - (optional) Number of items attempted
 */
export function trackReviewMediationItemAction( {
	action,
	target,
	outcome,
	clientRunId,
	itemCount,
}: TrackReviewMediationItemActionOptions ): void {
	const properties: TrackProperties = {
		action,
		target,
		outcome,
	};
	if ( clientRunId !== undefined ) {
		properties.client_run_id = clientRunId;
	}
	if ( itemCount !== undefined ) {
		properties.item_count = itemCount;
	}
	recordTracksEvent( 'ai_review_mediation_item_action', properties );
}

/**
 * Tracks a Review Mediation failure (load, render, apply, undo, or network).
 * @param options             - Tracking options
 * @param options.errorPhase  - Which step failed
 * @param options.errorType   - A short error code or message tag
 * @param options.clientRunId - (optional) Client-side join id
 */
export function trackReviewMediationError( {
	errorPhase,
	errorType,
	clientRunId,
}: TrackReviewMediationErrorOptions ): void {
	const properties: TrackProperties = {
		error_phase: errorPhase,
		error_type: errorType,
	};
	if ( clientRunId !== undefined ) {
		properties.client_run_id = clientRunId;
	}
	recordTracksEvent( 'ai_review_mediation_error', properties );
}
