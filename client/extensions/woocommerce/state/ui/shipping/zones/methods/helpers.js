/**
 * External dependencies
 */

import { findIndex, merge, remove } from 'lodash';

/**
 * Internal dependencies
 */
import { getBucket } from 'woocommerce/state/ui/helpers';

/**
 * @param {object} zoneMethodEdits Pre-existing edits made to the zone methods.
 * It's in the format { creates: [], updates: [], deletes: [] }
 * @param {object} [currentMethodEdits] Edits made to the zone's methods, but not committed yet
 * (i.e. the "Edit Zone" modal is still open). Same format as zoneMethodEdits
 * @returns {object} A merge of the 2 edit objects, or just zoneMethodEdits if currentMethodEdits is omitted
 */
export const mergeMethodEdits = ( zoneMethodEdits, currentMethodEdits ) => {
	if ( ! currentMethodEdits ) {
		return zoneMethodEdits;
	}
	const { creates, updates, deletes } = zoneMethodEdits;
	const {
		creates: currentCreates,
		updates: currentUpdates,
		deletes: currentDeletes,
		currentlyEditingId,
		currentlyEditingNew,
		currentlyEditingChangedType,
	} = currentMethodEdits;
	const mergedState = {
		creates: [ ...creates ],
		updates: [ ...updates ],
		deletes: [ ...deletes ],
		currentlyEditingId,
		currentlyEditingNew,
		currentlyEditingChangedType,
	};

	currentDeletes.forEach( ( { id } ) => {
		const bucket = getBucket( { id } );
		if ( 'updates' === bucket ) {
			mergedState.deletes.push( { id } );
		}
		remove( mergedState[ bucket ], { id } );
	} );

	currentCreates.forEach( ( create ) => {
		const index = findIndex( creates, { id: create.id } );
		if ( -1 === index ) {
			mergedState.creates.push( create );
		} else {
			mergedState.creates[ index ] = merge( {}, mergedState.creates[ index ], create );
		}
	} );

	currentUpdates.forEach( ( update ) => {
		const index = findIndex( updates, { id: update.id } );
		if ( -1 === index ) {
			mergedState.updates.push( update );
		} else {
			mergedState.updates[ index ] = merge( {}, mergedState.updates[ index ], update );
		}
	} );

	return mergedState;
};
