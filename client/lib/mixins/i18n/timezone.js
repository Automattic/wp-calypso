/**
 * External dependencies
 */
import tzdetect from 'jstimezonedetect';

/**
 * Detect and return the current timezone of the browser
 *
 * @return {String} timezone
 */
export function timezone() {
	var detected = tzdetect.jstz.determine();
	return detected ? detected.name() : null;
}
