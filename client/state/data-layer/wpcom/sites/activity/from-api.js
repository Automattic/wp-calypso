/** @format */
/**
 * External dependencies
 */
import { concat, flow, get, has, includes, overEvery, partial, partialRight, reduce } from 'lodash';

/**
 * Module constants
 */
export const ACTIVITY_REQUIRED_PROPS = [ 'activity_id', 'name', 'published', 'summary' ];

export const ACTIVITY_WHITELIST = [ 'post__updated' ];

/**
 * Transforms API response into array of activities
 *
 * @param  {object} _ API   response body
 * @param  {array}  _.items Array of item objects
 * @return {array}          Array of proccessed item objects
 */
export default function fromApi( { orderedItems = [] } ) {
	return reduce( orderedItems, itemsReducer, [] );
}

/**
 * Takes an Activity item in the API format returns true if it appears valid, otherwise false
 *
 * @param  {object}  item Activity item
 * @return {boolean}      True if the item appears to be valid, otherwise false.
 */
export const validateItem = overEvery( [
	partialRight( has, 'activity_id' ),
	partialRight( has, 'published' ),
	partialRight( has, 'summary' ),
	flow( partialRight( get, 'name', null ), partial( includes, ACTIVITY_WHITELIST ) ),
] );

/**
 * Reducer which recieves an array of processed items and an item to process and returns a new array
 * with the processed item appended if it is valid.
 *
 * @param  {array}  validProcessedItems Array of processed items
 * @param  {object} item                API format item to process
 * @return {array}                      Array of items with current item appended if valid
 */
export function itemsReducer( validProcessedItems, item ) {
	if ( ! validateItem( item ) ) {
		return validProcessedItems;
	}

	return concat( validProcessedItems, processItem( item ) );
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @return {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	return item;
}
