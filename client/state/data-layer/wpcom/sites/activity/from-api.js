/** @format */
/**
 * External dependencies
 */
import { get, head, map, split } from 'lodash';

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import apiResponseSchema from './schema';

/**
 * Module constants
 */
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {Object} apiResponse                      API response body
 * @param  {Array}  apiResponse.current.orderedItems Array of item objects
 * @return {Array}                                   Array of proccessed item objects
 */
export function transformer( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return map( orderedItems, processItem );
}

export function processItemActor( actor ) {
	return {
		actorAvatarUrl: get( actor, [ 'icon', 'url' ], DEFAULT_GRAVATAR_URL ),
		actorName: get( actor, [ 'name' ], '' ),
		actorRemoteId: get( actor, [ 'external_user_id' ], 0 ),
		actorRole: get( actor, [ 'role' ], '' ),
		actorType: get( actor, [ 'type' ], '' ),
		actorWpcomId: get( actor, [ 'wpcom_user_id' ], 0 ),
	};
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @return {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	const published = item.published;

	return {
		...processItemActor( item.actor ),
		activityDate: published,
		activityGroup: head( split( item.name, '__', 1 ) ),
		activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
		activityId: item.activity_id,
		activityIsDiscarded: null,
		activityName: item.name,
		activityStatus: item.status,
		activityTitle: get( item, 'summary', '' ),
		activityTs: Date.parse( published ),
	};
}

// fromApi default export
export default makeParser( apiResponseSchema, {}, transformer );
