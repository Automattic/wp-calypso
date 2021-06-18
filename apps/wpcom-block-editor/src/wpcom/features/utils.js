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

	return undefined;
};

export const findChange = ( newContent, oldContent, keyMap = [] ) => {
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
		return findChange( newContent[ addedKey ], oldContent?.[ addedKey ], keyMap );
	}

	return { keyMap, value: newContent[ addedKey ] };
};
