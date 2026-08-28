/**
 * Tracking helpers for Jetpack AI sidebar Tracks events.
 */

type TrackProperties = Record< string, string | number | boolean >;
export type BigSkyEventName = `jetpack_big_sky_${ string }`;

type ReviewContext =
	| 'notes_and_guidelines'
	| 'notes_only'
	| 'guidelines_only'
	| 'content_only'
	| 'insufficient_input';

type ResponseRenderedTrackingProperties = {
	suggested_edit_count: number;
	conflict_count?: number;
	implication_count?: number;
	guideline_violation_count?: number;
	review_context?: ReviewContext;
	cache_hit?: boolean;
};

const REVIEW_CONTEXTS: ReadonlySet< string > = new Set< ReviewContext >( [
	'notes_and_guidelines',
	'notes_only',
	'guidelines_only',
	'content_only',
	'insufficient_input',
] );

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		recordBigSkyTracksEvent?: (
			eventName: BigSkyEventName,
			props?: Record< string, unknown >
		) => void;
	};
};

/** Counts the non-null entries that a review response can render. */
function countResponseItems( value: unknown ): number {
	return Array.isArray( value ) ? value.filter( ( item ) => item != null ).length : 0;
}

/** Counts guideline findings that have the quote required by the rendered card. */
function countRenderableGuidelineViolations( value: unknown ): number {
	if ( ! Array.isArray( value ) ) {
		return 0;
	}

	return value.filter( ( item ) => {
		if ( typeof item !== 'object' || item === null ) {
			return false;
		}
		const quote = ( item as Record< string, unknown > ).guideline_quote;
		return typeof quote === 'string' && quote.trim() !== '';
	} ).length;
}

/** Accepts only the review-context vocabulary supplied by the AER server response. */
function getReviewContext( value: unknown ): ReviewContext | undefined {
	return typeof value === 'string' && REVIEW_CONTEXTS.has( value )
		? ( value as ReviewContext )
		: undefined;
}

/** Builds privacy-safe tracking metadata from Jetpack AI's known review payloads. */
export function getResponseRenderedTrackingProperties(
	componentType: string,
	props: Record< string, unknown >
): ResponseRenderedTrackingProperties | undefined {
	if ( componentType === 'proofread' || componentType === 'post-feedback' ) {
		return { suggested_edit_count: countResponseItems( props.items ) };
	}

	if ( componentType === 'ai-editorial-review' ) {
		const reviewContext = getReviewContext( props.review_context );
		return {
			suggested_edit_count: countResponseItems( props.suggested_edits ),
			conflict_count: countResponseItems( props.conflicts ),
			implication_count: countResponseItems( props.implications ),
			guideline_violation_count: countRenderableGuidelineViolations( props.guideline_violations ),
			...( reviewContext ? { review_context: reviewContext } : {} ),
			// Server-declared cache signal; older payloads omit it.
			...( typeof props.cache_hit === 'boolean' ? { cache_hit: props.cache_hit } : {} ),
		};
	}

	return undefined;
}

/**
 * Sends a `jetpack_big_sky_*` event through the Agents Manager family
 * recorder, which attaches the family's base props. A no-op until Agents
 * Manager has published its actions bridge; returns whether the event was
 * handed over.
 */
function recordBigSkyFamilyTracksEvent(
	eventName: BigSkyEventName,
	properties: TrackProperties
): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const record = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions
		?.recordBigSkyTracksEvent;
	if ( ! record ) {
		return false;
	}

	record( eventName, properties );
	return true;
}

interface TrackSplitScreenGuideOptions {
	componentType: string;
	toolCallId?: string;
}

function getSplitScreenGuideProperties( {
	componentType,
	toolCallId,
}: TrackSplitScreenGuideOptions ): TrackProperties {
	return {
		component_type: componentType,
		guide_variant: 'inline_action_card',
		...( toolCallId ? { tool_call_id: toolCallId } : {} ),
	};
}

/**
 * Tracks the split-screen guide's first visible appearance for a review result.
 * @param options               - Tracking options.
 * @param options.componentType - Existing show-component type.
 * @param options.toolCallId    - Tool call that produced the containing response.
 * @returns Whether the event reached the family recorder.
 */
export function trackSplitScreenGuideRendered( options: TrackSplitScreenGuideOptions ): boolean {
	return recordBigSkyFamilyTracksEvent(
		'jetpack_big_sky_split_screen_guide_rendered',
		getSplitScreenGuideProperties( options )
	);
}

/**
 * Tracks the split-screen guide action being selected.
 * @param options               - Tracking options.
 * @param options.componentType - Existing show-component type.
 * @param options.toolCallId    - Tool call that produced the containing response.
 * @returns Whether the event reached the family recorder.
 */
export function trackSplitScreenGuideClick( options: TrackSplitScreenGuideOptions ): boolean {
	return recordBigSkyFamilyTracksEvent(
		'jetpack_big_sky_split_screen_guide_click',
		getSplitScreenGuideProperties( options )
	);
}

/** Editor entity draft assist targets. Mirrors the ability's `contentType`. */
export type DraftAssistContentType = 'post' | 'page';

/** Why a draft could not be written into the editor. */
export type DraftAssistRejectionReason =
	| 'post_not_empty'
	| 'invalid_markup'
	| 'editor_unavailable'
	| 'unsupported_post_type';

/**
 * Tracks the draft assist entry point becoming visible in the editor — i.e. the
 * `/draft` placeholder replacing the default one on an empty post or page.
 * @param options             - Tracking options
 * @param options.contentType - Editor entity the entry point is offered on.
 * @returns Whether the event reached the family recorder.
 */
export function trackDraftAssistEntryPointShown( {
	contentType,
}: {
	contentType: DraftAssistContentType;
} ): boolean {
	return recordBigSkyFamilyTracksEvent( 'jetpack_big_sky_draft_assist_entry_point_shown', {
		content_type: contentType,
	} );
}

/**
 * Tracks the user firing the draft assist entry point.
 * @param options                  - Tracking options
 * @param options.contentType      - Editor entity the draft was requested for.
 * @param options.fromSlashCommand - Whether the `/draft` autocompleter fired it.
 * @returns Whether the event reached the family recorder.
 */
export function trackDraftAssistEntryPointTriggered( {
	contentType,
	fromSlashCommand,
}: {
	contentType: DraftAssistContentType;
	fromSlashCommand: boolean;
} ): boolean {
	return recordBigSkyFamilyTracksEvent( 'jetpack_big_sky_draft_assist_entry_point_triggered', {
		content_type: contentType,
		from_slash_command: fromSlashCommand,
	} );
}

/**
 * Tracks a generated draft being written into the editor canvas.
 * @param options             - Tracking options
 * @param options.contentType - Editor entity the draft was applied to.
 * @param options.blockCount  - Number of top-level blocks the markup parsed into.
 * @param options.hasTitle    - Whether the draft also set the post title.
 * @returns Whether the event reached the family recorder.
 */
export function trackDraftAssistDraftApplied( {
	contentType,
	blockCount,
	hasTitle,
}: {
	contentType: DraftAssistContentType;
	blockCount: number;
	hasTitle: boolean;
} ): boolean {
	return recordBigSkyFamilyTracksEvent( 'jetpack_big_sky_draft_assist_draft_applied', {
		content_type: contentType,
		block_count: blockCount,
		has_title: hasTitle,
	} );
}

/**
 * Tracks a generated draft being refused before anything was written — most
 * importantly when the post already had content the draft would have replaced.
 * @param options             - Tracking options
 * @param options.contentType - Editor entity the draft was meant for.
 * @param options.reason      - Why the draft was refused.
 * @returns Whether the event reached the family recorder.
 */
export function trackDraftAssistDraftRejected( {
	contentType,
	reason,
}: {
	contentType: DraftAssistContentType;
	reason: DraftAssistRejectionReason;
} ): boolean {
	return recordBigSkyFamilyTracksEvent( 'jetpack_big_sky_draft_assist_draft_rejected', {
		content_type: contentType,
		reason,
	} );
}
