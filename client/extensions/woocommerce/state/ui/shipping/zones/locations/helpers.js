/**
 * External dependencies
 */
import { pullAll, union } from 'lodash';

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
		pristine: currentLocationEdits.pristine,
	};
};
