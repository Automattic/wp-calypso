/**
 * Tracking helpers for Jetpack AI sidebar Tracks events.
 */

import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';

const TRACKS_PREFIX = 'jetpack';

type TrackProperties = Record< string, string | number | boolean >;

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
		getSessionId?: () => unknown;
	};
};

type EditorSelectStore =
	| {
			getCurrentPostType?: () => string | undefined;
	  }
	| undefined;

type BigSkyTrackingData = {
	sessionType: string;
	screen: string;
};

function getSessionId(): string | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	const agentsManagerActions = ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	const sessionId = agentsManagerActions?.getSessionId?.();
	return typeof sessionId === 'string' && sessionId !== '' ? sessionId : undefined;
}

function getCurrentPostType(): string {
	try {
		const editor = select( 'core/editor' ) as EditorSelectStore;
		return editor?.getCurrentPostType?.() ?? '';
	} catch {
		return '';
	}
}

function getBigSkyTrackingData(): BigSkyTrackingData {
	const state = typeof window !== 'undefined' ? window.bigSkyInitialState : undefined;
	if ( ! state ) {
		return { sessionType: 'unknown', screen: 'site-editor' };
	}

	return {
		sessionType: state.isFreeTrial ? 'free-trial-session' : 'paid-user-session',
		screen: state.currentScreen?.screen ?? 'site-editor',
	};
}

function getIsTest(): boolean {
	return typeof agentsManagerData !== 'undefined' && !! agentsManagerData?.isDevMode;
}

/** Reads the optional server-provided Automattician tracking signal. */
function getIsA11n(): boolean | undefined {
	const isA11n = typeof agentsManagerData !== 'undefined' ? agentsManagerData?.isA11n : undefined;
	return typeof isA11n === 'boolean' ? isA11n : undefined;
}

/** Reads the canonical server-provided blog ID when available. */
function getBlogId(): number | undefined {
	const blogId = typeof agentsManagerData !== 'undefined' ? agentsManagerData?.site?.ID : undefined;
	return typeof blogId === 'number' && Number.isInteger( blogId ) && blogId > 0
		? blogId
		: undefined;
}

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
		};
	}

	return undefined;
}

function recordTracksEvent( eventName: string, properties: TrackProperties = {} ): void {
	const sessionId = getSessionId();
	const isA11n = getIsA11n();
	const blogId = getBlogId();
	recordTracksEventBase( `${ TRACKS_PREFIX }_${ eventName }`, {
		...properties,
		...( sessionId ? { sessionid: sessionId } : {} ),
		...( isA11n !== undefined ? { is_a11n: isA11n } : {} ),
		...( blogId !== undefined ? { blog_id: blogId } : {} ),
	} );
}

interface TrackSplitScreenGuideOptions {
	componentType: string;
}

function getSplitScreenGuideProperties( {
	componentType,
}: TrackSplitScreenGuideOptions ): TrackProperties {
	const bigSky = getBigSkyTrackingData();

	return {
		component_type: componentType,
		guide_variant: 'inline_action_card',
		post_type: getCurrentPostType(),
		is_test: getIsTest(),
		session_type: bigSky.sessionType,
		screen: bigSky.screen,
	};
}

/**
 * Tracks the split-screen guide's first visible appearance for a review result.
 * @param options               - Tracking options.
 * @param options.componentType - Existing show-component type.
 */
export function trackSplitScreenGuideRendered( options: TrackSplitScreenGuideOptions ): void {
	recordTracksEvent( 'ai_split_screen_guide_rendered', getSplitScreenGuideProperties( options ) );
}

/**
 * Tracks the split-screen guide action being selected.
 * @param options               - Tracking options.
 * @param options.componentType - Existing show-component type.
 */
export function trackSplitScreenGuideClick( options: TrackSplitScreenGuideOptions ): void {
	recordTracksEvent( 'ai_split_screen_guide_click', getSplitScreenGuideProperties( options ) );
}

/**
 * Tracks navigation from the out-of-credits notice to the upgrade flow. No
 * request count is reported: the only usage figure the client has is the
 * page-load snapshot, and nothing refreshes it after a turn, so it would be
 * stale by the time exhaustion is reached.
 */
export function trackJetpackAiUpgrade(): void {
	recordTracksEvent( 'ai_upgrade_button', {
		placement: 'jetpack-ai-sidebar-quota-notice',
	} );
}
