/** @format */
/**
 * External dependencies
 */
import validator from 'is-my-json-valid';
import { concat, get, head, reduce, split } from 'lodash';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import { itemSchema, responseSchema } from './schema';

/**
 * Module constants
 */
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} apiResponse                      API response body
 * @param  {array}  apiResponse.current.orderedItems Array of item objects
 * @return {array}                                   Array of proccessed item objects
 */
export function transformer( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return reduce( orderedItems, itemsReducer, [] );
}

/**
 * Takes an Activity item in the API format returns true if it appears valid, otherwise false
 *
 * @param  {object}  item Activity item
 * @return {boolean}      True if the item appears to be valid, otherwise false.
 */
export function validateItem( item ) {
	const validate = validator( itemSchema );
	const valid = validate( item );
	if ( ! valid ) {
		warn( 'Invalid item found and ignored:', item, 'with reason:', validate.errors );
	}
	return valid;
}

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
	return {
		...processItemBase( item ),
	};
}

export function processItemActor( item ) {
	return {
		actorAvatarUrl: get( item, [ 'actor', 'icon', 'url' ], DEFAULT_GRAVATAR_URL ),
		actorName: get( item, [ 'actor', 'name' ], '' ),
		actorRemoteId: get( item, [ 'actor', 'external_user_id' ], 0 ),
		actorRole: get( item, [ 'actor', 'role' ], '' ),
		actorType: get( item, [ 'actor', 'type' ], '' ),
		actorWpcomId: get( item, [ 'actor', 'wpcom_user_id' ], 0 ),
	};
}

export function processItemBase( item ) {
	const published = get( item, 'published' );
	return {
		...processItemActor( item ),
		activityDate: published,
		activityGroup: head( split( get( item, 'name' ), '__', 1 ) ),
		activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
		activityId: get( item, 'activity_id' ),
		activityName: get( item, 'name' ),
		activityStatus: get( item, 'status' ),
		activityTitle: get( item, 'summary', '' ),
		activityTs: Date.parse( published ),
	};
}

// fromApi default export
export default makeParser( responseSchema, {}, transformer );
