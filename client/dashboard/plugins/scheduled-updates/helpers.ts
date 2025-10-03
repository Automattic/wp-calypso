import { __ } from '@wordpress/i18n';
import type { TimeSlot, Frequency, Weekday, ScheduleCollisions } from './types';
import type { Site } from '@automattic/api-core';

export function prepareTimestamp(
	frequency: Frequency,
	weekday: Weekday,
	time: string // HH:MM (24h)
): number {
	const event = new Date();
	const now = new Date();

	const [ hourStr ] = time.split( ':' );
	const hour = parseInt( hourStr, 10 ) % 24;
	event.setHours( hour, 0, 0, 0 );

	if ( frequency === 'daily' && event < now ) {
		event.setDate( event.getDate() + 1 );
	}

	if ( frequency === 'weekly' ) {
		const weekdayToNumber: Record< Weekday, number > = {
			Sunday: 0,
			Monday: 1,
			Tuesday: 2,
			Wednesday: 3,
			Thursday: 4,
			Friday: 5,
			Saturday: 6,
		};
		const targetDay = weekdayToNumber[ weekday ];
		let dayDifference = targetDay - now.getDay();
		if ( dayDifference === 0 && event < now ) {
			dayDifference += 7;
		}
		event.setDate( event.getDate() + dayDifference + ( dayDifference < 0 ? 7 : 0 ) );
	}

	return event.getTime() / 1000;
}
/**
 * Checks for time slot collisions.
 * @param proposed - The proposed time slot.
 * @param existing - The existing time slots.
 * @returns The error message if there is a collision, otherwise an empty string.
 */
export function validateTimeSlot( proposed: TimeSlot, existing: TimeSlot[] = [] ): string {
	const newDate = new Date( proposed.timestamp * 1000 );

	if ( newDate < new Date() ) {
		return __( 'Please choose a time in the future for this schedule.' );
	}

	for ( const slot of existing ) {
		const existingDate = new Date( slot.timestamp * 1000 );

		if (
			( proposed.frequency === 'daily' || slot.frequency === 'daily' ) &&
			existingDate.getHours() === newDate.getHours()
		) {
			return __( 'Please choose another time, as this slot is already scheduled.' );
		}

		if (
			proposed.frequency === 'weekly' &&
			slot.frequency === 'weekly' &&
			newDate.getDay() === existingDate.getDay() &&
			newDate.getHours() === existingDate.getHours()
		) {
			return __( 'Please choose another time, as this slot is already scheduled.' );
		}
	}

	return '';
}

/**
 * Limited concurrency runner
 * @param tasks - The tasks to run.
 * @param limit - The limit of concurrent tasks.
 * @returns The result of the tasks.
 */
export const runWithConcurrency = async (
	tasks: Array< () => Promise< unknown > >,
	limit: number
) => {
	const executing = new Set< Promise< unknown > >();

	for ( const task of tasks ) {
		const p = task().finally( () => executing.delete( p ) );
		executing.add( p );

		if ( executing.size >= limit ) {
			await Promise.race( executing );
		}
	}

	await Promise.allSettled( Array.from( executing ) );
};

/**
 * Validate plugins against existing schedules
 * - Must select at least one plugin
 * - If existing plugin sets are provided, block identical set
 * @param plugins - The plugins to validate.
 * @param existingPlugins - The existing plugin sets.
 * @returns The error message if there is a collision, otherwise an empty string.
 */
export function validatePlugins(
	plugins: string[],
	existingPlugins: Array< string[] > = []
): string {
	let error = '';

	if ( plugins.length === 0 ) {
		error = __( 'Please select at least one plugin to update.' );
	} else if ( existingPlugins.length ) {
		const normalized = [ ...plugins ].sort();
		for ( const existing of existingPlugins ) {
			if ( JSON.stringify( normalized ) === JSON.stringify( [ ...existing ].sort() ) ) {
				error = __(
					'Please select a different set of plugins, as this one has already been chosen.'
				);
				break;
			}
		}
	}

	return error;
}

/**
 * Formats a multi-line error string for schedule collisions, including both time and
 * plugin collisions when present. It conditionally appends a list of site slugs for
 * each collision type when the collision affects a strict subset of the selected sites.
 *
 * Lines are separated by "\n" and are suitable for rendering as multiple divs.
 */
export function formatScheduleCollisionsErrorMulti( {
	collisions: { timeCollisions, pluginCollisions },
	eligibleSites,
	selectedSiteIds,
}: {
	collisions: ScheduleCollisions;
	eligibleSites: Site[];
	selectedSiteIds: number[];
} ): string {
	const siteMap = new Map( eligibleSites.map( ( site ) => [ site.ID, site ] ) );

	const formatLine = ( error: string, collidingSiteIds: number[] ) => {
		if ( ! error ) {
			return '';
		}

		const shouldListSites =
			collidingSiteIds.length > 0 && collidingSiteIds.length < selectedSiteIds.length;

		if ( ! shouldListSites ) {
			return error;
		}

		const siteList = collidingSiteIds
			.map( ( id ) => siteMap.get( id )?.slug || String( id ) )
			.join( ', ' );

		// translators: %s is a comma-separated list of site slugs.
		const sitesLine = __( 'Sites: %s' ).replace( '%s', siteList );
		return `${ error }\n${ sitesLine }`;
	};

	const lines: string[] = [];
	const timeLine = formatLine( timeCollisions.error, timeCollisions.collidingSiteIds );
	if ( timeLine ) {
		lines.push( timeLine );
	}
	const pluginLine = formatLine( pluginCollisions.error, pluginCollisions.collidingSiteIds );
	if ( pluginLine ) {
		lines.push( pluginLine );
	}

	return lines.join( '\n' );
}

/**
 * Normalize a schedule ID coming from a human-readable URL,
 * in case it includes derived suffixes like "-daily-<interval>-<HH:MM>",
 * which are not part of the map key.
 *
 * Why this exists:
 * - Pretty URLs may append metadata to the base schedule ID (e.g., "-daily-<interval>-<HH:MM>")
 * so links are readable and reflect key params.
 * - The base ID is the canonical storage key used by the API; suffixes are not part of the map key.
 * - Uniqueness is per site; the same base ID can exist on multiple sites, which is expected in multisite.
 * @param id string Possibly-suffixed schedule ID from the route
 * @returns string Base schedule ID suitable for API map lookups
 */
export function normalizeScheduleId( id: string ): string {
	const m = id.match( /^(.*)-(daily|weekly)-(\d+)-(\d{2}:\d{2})$/ );
	return m ? m[ 1 ] : id;
}
