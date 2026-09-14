/**
 * Tracking helpers for Jetpack AI sidebar Tracks events.
 */

type TrackProperties = Record< string, string | number | boolean >;
export type BigSkyEventName = `jetpack_big_sky_${ string }`;

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		recordBigSkyTracksEvent?: (
			eventName: BigSkyEventName,
			props?: Record< string, unknown >
		) => void;
	};
};

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
