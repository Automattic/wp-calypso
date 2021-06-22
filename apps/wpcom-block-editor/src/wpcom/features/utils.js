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

export const buildGlobalStylesEventProps = ( keyMap, value ) => {
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
