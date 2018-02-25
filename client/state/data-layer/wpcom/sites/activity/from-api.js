/** @format */
/**
 * External dependencies
 */
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import { parseBlock } from 'lib/notifications/note-block-parser';
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
 * @param  {object} apiResponse API response body
 * @return {object}             Object with an entry for proccessed item objects and another for oldest item timestamp
 */
export function transformer( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return Object.assign(
		{
			items: map( orderedItems, processItem ),
			oldestItemTs: get( apiResponse, [ 'oldestItemTs' ], Infinity ),
			totalItems: get( apiResponse, [ 'totalItems' ], orderedItems.length ),
		},
		apiResponse.nextAfter && { nextAfter: apiResponse.nextAfter },
		apiResponse.prevBefore && { prevBefore: apiResponse.prevBefore }
	);
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @return {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	const published = item.published;
	const actor = item.actor;

	return {
		/* activity actor */
		actorAvatarUrl: get( actor, 'icon.url', DEFAULT_GRAVATAR_URL ),
		actorName: get( actor, 'name', '' ),
		actorRemoteId: get( actor, 'external_user_id', 0 ),
		actorRole: get( actor, 'role', '' ),
		actorType: get( actor, 'type', '' ),
		actorWpcomId: get( actor, 'wpcom_user_id', 0 ),

		/* base activity info */
		activityDate: published,
		activityGroup: ( item.name || '' ).split( '__', 1 )[ 0 ], // split always returns at least one item
		activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
		activityId: item.activity_id,
		activityIsDiscarded: item.is_discarded,
		activityIsRewindable: item.is_rewindable,
		rewindId: item.rewind_id,
		activityName: item.name,
		activityStatus: item.status,
		activityTargetTs: get( item, 'object.target_ts', undefined ),
		activityTitle: item.summary,
		activityTs: Date.parse( published ),
		activityDescription: parseBlock( item.content ),
	};
}

// fromApi default export
export default makeParser( apiResponseSchema, {}, transformer );
