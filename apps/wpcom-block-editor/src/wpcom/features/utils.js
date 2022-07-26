import { select } from '@wordpress/data';
import { isEqual, some, debounce } from 'lodash';
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
 * Helper for `getBlockEventContextProperties` function.  Builds the properties to return based on
 * the block provided.
 *
 * @param {object} block block object that provides context.
 * @returns	{object} Properties for tracking event.
 */
const buildPropsFromContextBlock = ( block ) => {
	let context = block?.name;

	if ( block?.name === 'core/template-part' ) {
		const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;
		const { getActiveBlockVariation } = select( 'core/blocks' );

		if ( typeof getActiveBlockVariation === 'function' ) {
			const variation = getActiveBlockVariation( block.name, block.attributes );

			if ( variation?.name ) {
				context = `${ context }/${ variation.name }`;
			}
		}

		return {
			entity_context: context,
			template_part_id: templatePartId,
		};
	}

	return {
		entity_context: context,
	};
};

/**
 * Determines the entity context props of a block event, given the rootClientId of the
 * block action.
 *
 * @param {string} rootClientId The rootClientId of the block event.
 * @returns {object} The block event's context properties.
 */
export const getBlockEventContextProperties = ( rootClientId ) => {
	const { getBlockParentsByBlockName, getBlock } = select( 'core/block-editor' );

	// If this function doesn't exist, we cannot support context tracking.
	if ( typeof getBlockParentsByBlockName !== 'function' ) {
		return {};
	}

	const editorType = getEditorType();
	const defaultReturn = editorType === 'site' ? { entity_context: 'template' } : {};

	// No root implies top level.
	if ( ! rootClientId ) {
		return defaultReturn;
	}

	// Context controller blocks to check for.
	const contexts = [ 'core/template-part', 'core/post-content', 'core/block', 'core/query' ];

	// Check if the root matches a context controller.
	const rootBlock = getBlock( rootClientId );
	if ( contexts.some( ( context ) => context === rootBlock?.name ) ) {
		return buildPropsFromContextBlock( rootBlock );
	}

	// Check if the root's parents match a context controller.
	const matchingParentIds = getBlockParentsByBlockName( rootClientId, contexts, true );
	if ( matchingParentIds.length ) {
		return buildPropsFromContextBlock( getBlock( matchingParentIds[ 0 ] ) );
	}

	return defaultReturn;
};

/**
 * Compares two objects, returning values in newObject that do not correspond
 * to values in oldObject.
 *
 * @param {object|Array} newObject The object that has had an update.
 * @param {object|Array} oldObject The original object to reference.
 * @param {Array}  		 keyMap    Used in recursion.  A list of keys mapping to the changed item.
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
 * Creates an array from all object properties, recursively.
 *
 * @param {Object} obj	Any object.
 * @returns {Array}		Array of all object properties.
 */
function propertiesToArray( obj ) {
	const isObject = ( val ) => val && typeof val === 'object' && ! Array.isArray( val );
	const addDelimiter = ( a, b ) => ( a ? `${ a }.${ b }` : b );
	const paths = ( object = {}, head = '' ) => {
		return Object.entries( object ).reduce( ( product, [ key, value ] ) => {
			const fullPath = addDelimiter( head, key );
			return isObject( value )
				? product.concat( paths( value, fullPath ) )
				: product.concat( fullPath );
		}, [] );
	};
	return paths( obj );
}

/**
 * Records Tracks events for global styles updates.
 *
 * @param {Object} updated   The updated global styles content object.
 * @param {Object} original	 The original global styles content object.
 * @param {string} eventName Name of the tracks event to send.
 * @returns {void}
 */
const trackGlobalStylesEvents = ( updated, original, eventName ) => {
	findUpdates( updated, original )?.forEach( ( { keyMap, value } ) => {
		tracksRecordEvent( eventName, buildGlobalStylesEventProps( keyMap, value ) );
	} );
};

/**
 * Debounce wrapper for trackGlobalStylesEvent().
 */
const debounceTrackGlobalStylesEvents = debounce( trackGlobalStylesEvents, 300 );

/**
 * Builds and sends tracks events for global styles changes.
 *
 * @param {Object} updated   The updated global styles content object.
 * @param {Object} original	 The original global styles content object.
 * @param {string} eventName Name of the tracks event to send.
 */
export const buildGlobalStylesContentEvents = ( updated, original, eventName ) => {
	const originalProperties = propertiesToArray( original );
	const updatedProperties = propertiesToArray( updated );

	// Debouncing is necessary to avoid spamming tracks events when
	// using continuous controls like sliders or color pickers.
	// We do it conditionally so we only debounce recurring updates
	// to the same controls/styles. Some controls update multiple
	// styles at once, in which case we do not want to debounce.
	if ( isEqual( originalProperties, updatedProperties ) ) {
		debounceTrackGlobalStylesEvents( updated, original, eventName );
	} else {
		trackGlobalStylesEvents( updated, original, eventName );
	}
};

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

/**
 * Checks the editor for open saving interfaces and returns the result.
 *
 * @returns {string} Name of saving interface found.
 */
export const findSavingSource = () => {
	const savePanel = document.querySelector( '.entities-saved-states__panel' );
	// Currently we only expect these save actions to trigger from the save panel.
	// However, we fall back to 'unknown' in case some new saving mechanism is added.
	return savePanel ? 'multi-entity-save-panel' : 'unknown';
};
