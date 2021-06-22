/**
 * External Dependencies
 */
import { isEqual, some } from 'lodash';

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
 * @param {object} newObject The object that has had an update.
 * @param {object} oldObject The original object to reference.
 * @param {Array}  keyMap     Used in recursion.  A list of keys mapping to the changed item.
 *
 * @returns {Array[object]} Array of objects containing a keyMap array and value for the changed items.
 */
export const compareObjects = ( newObject, oldObject, keyMap = [] ) => {
	if ( isEqual( newObject, oldObject ) ) {
		return [];
	}

	const changedItems = [];
	for ( const prop of Object.keys( newObject ) ) {
		if ( ! isEqual( newObject[ prop ], oldObject?.[ prop ] ) ) {
			// ?? where it doesnt exist in old content vs when it does?
			if ( Array.isArray( newObject ) ) {
				changedItems.push( { keyMap: [ ...keyMap, prop ], value: newObject[ prop ] || 'reset' } );
			} else if ( typeof newObject[ prop ] === 'object' && newObject[ prop ] !== null ) {
				changedItems.push(
					...compareObjects( newObject[ prop ], oldObject?.[ prop ], [ ...keyMap, prop ] )
				);
			} else {
				changedItems.push( { keyMap: [ ...keyMap, prop ], value: newObject[ prop ] || 'reset' } );
			}
		}
	}

	return changedItems;
};

export const findUpdates = ( newContent, oldContent ) => {
	const newItems = compareObjects( newContent, oldContent );

	const removedItems = compareObjects( oldContent, newContent ).filter(
		( update ) => ! some( newItems, ( { keyMap } ) => isEqual( update.keyMap, keyMap ) )
	);
	removedItems.forEach( ( item ) => {
		item.value = 'reset';
	} );

	return [ ...newItems, ...removedItems ];
};
