import { getLocation } from './get-location';
import { getTracksPropertiesForPost } from './get-tracks-properties-for-post';
import type { ReaderEventProperties, ReaderPost } from './types';

/**
 *
 * @param {ReaderEventProperties} eventProperties extra event properties to add
 * @param {string|undefined} pathnameOverride Overwrites location used for determining ui_algo. See notes in
 * `recordTrack` function docs for more info.
 * @param {ReaderPost|null|undefined} post Optional post object used to build post event props.
 * @returns {ReaderEventProperties} new eventProperties object with default reader values added.
 */
export function buildReaderTracksEventProps(
	eventProperties: ReaderEventProperties,
	pathnameOverride?: string | null,
	post?: ReaderPost | null
): ReaderEventProperties {
	const location = getLocation( pathnameOverride || window.location.pathname );
	let composedProperties = Object.assign( { ui_algo: location }, eventProperties );
	if ( post ) {
		composedProperties = Object.assign( getTracksPropertiesForPost( post ), composedProperties );
	}
	return composedProperties;
}
