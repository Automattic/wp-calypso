/**
 * External Dependencies
 */
import { isEqual, find } from 'lodash';

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
 * Finds a change between two like objects.
 * Only the first found change is returned, this is useful if only
 * one change is expected.
 *
 * @param {object} newContent The object that has had an update.
 * @param {object} oldContent The original object to reference.
 * @param {Array}  keyMap     Used in recursion.  A list of keys mapping to the changed item.
 *
 * @returns {object} Object containing a keyMap array and value for the changed item.
 */
export const findUpdate = ( newContent, oldContent, keyMap = [] ) => {
	if ( isEqual( newContent, oldContent ) ) {
		return { keyMap, value: null };
	}

	let addedKey;
	find( newContent, ( value, key ) => {
		if ( ! isEqual( value, oldContent?.[ key ] ) ) {
			keyMap.push( key );
			addedKey = key;
			return true;
		}
	} );

	if ( addedKey && typeof newContent[ addedKey ] === 'object' ) {
		return findUpdate( newContent[ addedKey ], oldContent?.[ addedKey ], keyMap );
	}

	return { keyMap, value: newContent[ addedKey ] };
};
