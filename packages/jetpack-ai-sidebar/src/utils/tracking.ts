/**
 * Tracking helpers for Jetpack AI sidebar Tracks events.
 */

import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';

const TRACKS_PREFIX = 'jetpack';

type TrackProperties = Record< string, string | number | boolean >;

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

function recordTracksEvent( eventName: string, properties: TrackProperties = {} ): void {
	const sessionId = getSessionId();
	const isA11n = getIsA11n();
	recordTracksEventBase( `${ TRACKS_PREFIX }_${ eventName }`, {
		...properties,
		...( sessionId ? { sessionid: sessionId } : {} ),
		...( isA11n !== undefined ? { is_a11n: isA11n } : {} ),
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
