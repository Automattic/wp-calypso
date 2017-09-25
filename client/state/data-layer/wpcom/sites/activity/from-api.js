/** @format */
/**
 * External dependencies
 */
import { concat, get, has, head, map, overEvery, partial, partialRight, reduce, split } from 'lodash';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

/**
 * Module constants
 */
export const ACTIVITY_REQUIRED_PROPS = [ 'activity_id', 'name', 'published', 'summary' ];
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} apiResponse                      API response body
 * @param  {array}  apiResponse.current.orderedItems Array of item objects
 * @return {array}                                   Array of proccessed item objects
 */
export default function fromApi( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return reduce( orderedItems, itemsReducer, [] );
}

/**
 * Takes an Activity item in the API format returns true if it appears valid, otherwise false
 *
 * @param  {object}  item Activity item
 * @return {boolean}      True if the item appears to be valid, otherwise false.
 */
export const validateItem = overEvery(
	map( ACTIVITY_REQUIRED_PROPS, partial( partialRight, has ) )
);

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
		warn( 'Activity item fails validation and has been omitted: %o', item );
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
		activityTitle: get( item, 'summary', '' ),
		activityTs: Date.parse( published ),
	};
}
