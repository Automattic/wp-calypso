/**
 * External Dependencies
 */
import { isEqual, some, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './tracking/track-record-event';

/**
 * Determines the type of the block editor.
 *
 * @returns {(string|undefined)} editor's type
 */
export const getEditorType = () => {
	if ( document.querySelector( '.edit-post-layout' ) ) {
		return 'post';
	}

	if ( document.querySelector( '#edit-site-editor' ) ) {
		return 'site';
	}

	if ( document.querySelector( '#widgets-editor' ) ) {
		return 'widgets';
	}

	if ( document.querySelector( '#customize-controls .customize-widgets__sidebar-section.open' ) ) {
		return 'customize-widgets';
	}

	return undefined;
};

/**
 * Compares two objects, returning values in newObject that do not correspond
 * to values in oldObject.
 *
 * @param {object|Array} newObject The object that has had an update.
 * @param {object|Array} oldObject The original object to reference.
 * @param {Array}  		 keyMap    Used in recursion.  A list of keys mapping to the changed item.
 *
 * @returns {Array[object]} Array of objects containing a keyMap array and value for the changed items.
 */
const compareObjects = ( newObject, oldObject, keyMap = [] ) => {
	if ( isEqual( newObject, oldObject ) ) {
		return [];
	}

	const changedItems = [];
	for ( const key of Object.keys( newObject ) ) {
		// If an array, key/value association may not be maintained.
		// So we must check against the entire collection instead of by key.
		if ( Array.isArray( newObject ) ) {
			if ( ! some( oldObject, ( item ) => isEqual( item, newObject[ key ] ) ) ) {
				changedItems.push( { keyMap: [ ...keyMap ], value: newObject[ key ] || 'reset' } );
			}
		} else if ( ! isEqual( newObject[ key ], oldObject?.[ key ] ) ) {
			if ( typeof newObject[ key ] === 'object' && newObject[ key ] !== null ) {
				changedItems.push(
					...compareObjects( newObject[ key ], oldObject?.[ key ], [ ...keyMap, key ] )
				);
			} else {
				changedItems.push( { keyMap: [ ...keyMap, key ], value: newObject[ key ] || 'reset' } );
			}
		}
	}

	return changedItems;
};

/**
 * Compares two objects by running compareObjects in both directions.
 * This returns items in newContent that are different from those found in oldContent.
 * Additionally, items found in oldContent that are not in newContent are added to the
 * change list with their value as 'reset'.
 *
 * @param {object} newContent The object that has had an update.
 * @param {object} oldContent The original object to reference.
 *
 * @returns {Array[object]} Array of objects containing a keyMap array and value for the changed items.
 */
const findUpdates = ( newContent, oldContent ) => {
	const newItems = compareObjects( newContent, oldContent );

	const removedItems = compareObjects( oldContent, newContent ).filter(
		( update ) => ! some( newItems, ( { keyMap } ) => isEqual( update.keyMap, keyMap ) )
	);
	removedItems.forEach( ( item ) => {
		if ( item.value?.color ) {
			// So we don't override information about which color palette item was reset.
			item.value.color = 'reset';
		} else if ( typeof item.value === 'object' && item.value !== null ) {
			// A safety - in case there happen to be any other objects in the future
			// that slip by our mapping process, add an 'is_reset' prop to the object
			// so the data about what was reset is not lost/overwritten.
			item.value.is_reset = true;
		} else {
			item.value = 'reset';
		}
	} );

	return [ ...newItems, ...removedItems ];
};

/**
 * Builds tracks event props for a change in global styles.
 *
 * @param {Array[string]} keyMap A list of keys mapping to the changed item in the global styles content object.
 * @param {*} 			  value  New value of the updated item.
 *
 * @returns {object} An object containing the event properties for a global styles change.
 */
const buildGlobalStylesEventProps = ( keyMap, value ) => {
	let blockName;
	let elementType;
	let changeType;
	let propertyChanged;
	let fieldValue = value;
	let paletteSlug;

	if ( keyMap[ 1 ] === 'blocks' ) {
		blockName = keyMap[ 2 ];
		if ( keyMap[ 3 ] === 'elements' ) {
			elementType = keyMap[ 4 ];
			changeType = keyMap[ 5 ];
			propertyChanged = keyMap[ 6 ];
		} else {
			changeType = keyMap[ 3 ];
			propertyChanged = keyMap[ 4 ];
		}
	} else if ( keyMap[ 1 ] === 'elements' ) {
		elementType = keyMap[ 2 ];
		changeType = keyMap[ 3 ];
		propertyChanged = keyMap[ 4 ];
	} else {
		changeType = keyMap[ 1 ];
		propertyChanged = keyMap[ 2 ];
	}

	if ( propertyChanged === 'palette' ) {
		fieldValue = value.color || 'reset';
		paletteSlug = value.slug;
	}

	return {
		block_type: blockName,
		element_type: elementType,
		section: changeType,
		field: propertyChanged,
		field_value:
			typeof fieldValue === 'object' && fieldValue !== null
				? JSON.stringify( fieldValue )
				: fieldValue,
		palette_slug: paletteSlug,
	};
};

/**
 * Builds and sends tracks events for global styles changes.
 *
 * @param {Object} updated   The updated global styles content object.
 * @param {Object} original	 The original global styles content object.
 * @param {string} eventName Name of the tracks event to send.
 */
export const buildGlobalStylesContentEvents = debounce( ( updated, original, eventName ) => {
	// Debouncing is necessary to avoid spamming tracks events with updates when sliding inputs
	// such as a color picker are in use.
	return findUpdates( updated, original )?.forEach( ( { keyMap, value } ) => {
		tracksRecordEvent( eventName, buildGlobalStylesEventProps( keyMap, value ) );
	} );
}, 100 );

export const getFlattenedBlockNames = ( block ) => {
	const blockNames = [];

	const queue = Array.isArray( block ) ? [ ...block ] : [ block ];
	while ( queue.length > 0 ) {
		const currentBlock = queue.shift();

		blockNames.push( currentBlock.name );

		for ( const innerBlock of currentBlock.innerBlocks ) {
			queue.unshift( innerBlock );
		}
	}

	return blockNames;
};
