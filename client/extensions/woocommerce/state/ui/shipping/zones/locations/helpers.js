/**
 * External dependencies
 */

import { pullAll, union } from 'lodash';

/**
 * @param {object} zoneLocationEdits Pre-existing edits made to the zone locations.
 * It's in the format { journal: [], states: { add: [], remove: [], removeAll: Bool }, postcode: String, pristine: Bool }
 * @param {object} [currentLocationEdits] Edits made to the zone's methods, but not committed yet
 * (i.e. the "Edit Locations" modal is still open). Same format as zoneLocationEdits
 * @returns {object} A merge of the 2 edit objects, or just zoneLocationEdits if currentLocationEdits is omitted
 */
export const mergeLocationEdits = ( zoneLocationEdits, currentLocationEdits ) => {
	if ( ! currentLocationEdits || currentLocationEdits.pristine ) {
		return zoneLocationEdits;
	}
	const { journal, states } = zoneLocationEdits;
	const {
		journal: currentJournal,
		states: currentStates,
		postcode: currentPostcode,
	} = currentLocationEdits;

	let mergedStates = null;
	if ( null !== currentStates ) {
		if ( null === states ) {
			mergedStates = currentStates;
		} else {
			mergedStates = {
				add: currentStates.removeAll ? [] : [ ...states.add ],
				remove: currentStates.removeAll ? [] : [ ...states.remove ],
				removeAll: states.removeAll || currentStates.removeAll,
			};
			pullAll( mergedStates.add, currentStates.remove );
			pullAll( mergedStates.remove, currentStates.add );
			mergedStates.add = union( mergedStates.add, currentStates.add );
			mergedStates.remove = union( mergedStates.remove, currentStates.remove );
		}
	}

	return {
		journal: [ ...journal, ...currentJournal ],
		states: mergedStates,
		postcode: currentPostcode,
		pristine: currentLocationEdits.pristine && zoneLocationEdits.pristine,
	};
};
