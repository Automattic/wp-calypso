import { select } from '@wordpress/data';
import { isEqual, some } from 'lodash';
import tracksRecordEvent from './tracking/track-record-event';

/**
 * Determines the type of the block editor.
 *
 * @returns {(string|undefined)} editor's type
 */
export const getEditorType = () => {
	if ( document.querySelector( '#editor .edit-post-layout' ) ) {
		return 'post';
	}

	if ( document.querySelector( '#site-editor' ) ) {
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
 * @param {Object} block block object that provides context.
 * @returns	{Object} Properties for tracking event.
 */
const buildPropsFromContextBlock = ( block ) => {
	let context = block?.name;

	if ( block?.name === 'core/template-part' ) {
		const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;

		const entity = select( 'core' ).getEntityRecord(
			'postType',
			'wp_template_part',
			templatePartId
		);

		if ( entity?.area && entity?.area !== 'uncategorized' ) {
			context = `${ context }/${ entity.area }`;
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
 * @returns {Object} The block event's context properties.
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
 * @param {Object | Array} newObject The object that has had an update.
 * @param {Object | Array} oldObject The original object to reference.
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
 * @param {Object} newContent The object that has had an update.
 * @param {Object} oldContent The original object to reference.
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
 * @returns {Object} An object containing the event properties for a global styles change.
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

let lastCalled;
let originalGSObject;
let functionTimeoutId;
const debounceTimer = 500;
/**
 * Creates the Tracks events for global styles changes. The logic is wrapped
 * in a setTimeout to allow for custom debouncing when invoked.
 *
 * @param {Object} updated   The updated global styles content object.
 * @param {string} eventName Name of the tracks event to send.
 */
const trackEventsWithTimer = ( updated, eventName ) => {
	functionTimeoutId = setTimeout(
		() =>
			findUpdates( updated, originalGSObject )?.forEach( ( { keyMap, value } ) => {
				tracksRecordEvent( eventName, buildGlobalStylesEventProps( keyMap, value ) );
			} ),
		debounceTimer
	);
};

/**
 * Builds and sends tracks events for global styles changes. We set and use
 * some timing variables to allow for custom debouncing. This is needed
 * to avoid spamming tracks events when using continuous inputs such as a
 * slider or color picker.
 *
 * @param {Object} updated   The updated global styles content object.
 * @param {Object} original  The original global styles content object.
 * @param {string} eventName Name of the tracks event to send.
 */
export const buildGlobalStylesContentEvents = ( updated, original, eventName ) => {
	// check timing since last call
	const hasntBeenCalled = ! lastCalled;
	const timeCalled = new Date().getTime();
	const recentlyCalled = timeCalled - lastCalled < debounceTimer;
	lastCalled = timeCalled;

	if ( hasntBeenCalled || ! recentlyCalled ) {
		// if not called recently -> set original for later reference
		originalGSObject = original;
		trackEventsWithTimer( updated, eventName );
	} else {
		// else -> cancel delayed function call - reset it with new updated value
		clearTimeout( functionTimeoutId );
		trackEventsWithTimer( updated, eventName );
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
