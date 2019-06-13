/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Returns the localized duration of a task in given minutes.
 *
 * @param  minutes Number of minutes.
 * @return Localized duration.
 */
export function getJetpackChecklistTaskDuration( minutes: number ): string {
	return translate( '%d minute', '%d minutes', { count: minutes, args: [ minutes ] } );
}
