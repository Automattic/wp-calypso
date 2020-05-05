/**
 * External dependencies
 */
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import apiResponseSchema from './schema';
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import { parseBlock } from 'lib/notifications/note-block-parser';

/**
 * Module constants
 */
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} apiResponse API response body
 * @returns {object}             Object with an entry for proccessed item objects and another for oldest item timestamp
 */
export function transformer( apiResponse ) {
	return get( apiResponse, [ 'current', 'orderedItems' ], [] ).map( processItem );
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @returns {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	const { actor, object, published, first_published } = item;
	const activityDate = first_published ? first_published : published;
	const activityMeta = {};
	switch ( item.name ) {
		case 'rewind__backup_error':
			if ( '2' === get( item.object, 'error_code', '' ) ) {
				activityMeta.errorCode = 'bad_credentials';
			}
			break;
	}

	return Object.assign(
		{
			/* activity actor */
			actorAvatarUrl: get( actor, 'icon.url', DEFAULT_GRAVATAR_URL ),
			actorName: get( actor, 'name', '' ),
			actorRemoteId: get( actor, 'external_user_id', 0 ),
			actorRole: get( actor, 'role', '' ),
			actorType: get( actor, 'type', '' ),
			actorWpcomId: get( actor, 'wpcom_user_id', 0 ),

			/* base activity info */
			activityDate,
			activityGroup: ( item.name || '' ).split( '__', 1 )[ 0 ], // split always returns at least one item
			activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
			activityId: item.activity_id,
			activityIsRewindable: item.is_rewindable,
			activityName: item.name,
			activityTitle: item.summary,
			activityTs: Date.parse( activityDate ),
			activityDescription: parseBlock( item.content ),
			activityMedia: get( item, 'image' ),
			activityMeta,
		},
		item.rewind_id && { rewindId: item.rewind_id },
		item.status && { activityStatus: item.status },
		object && object.target_ts && { activityTargetTs: object.target_ts },
		object && object.type && { activityType: object.type },
		item.is_aggregate && { isAggregate: item.is_aggregate },
		item.streams && { streams: item.streams.map( processItem ) },
		item.stream_count && { streamCount: item.stream_count },
		item.first_published && { firstPublishedDate: item.first_published },
		item.last_published && { lastPublishedDate: item.last_published },
		! isUndefined( item.streams_have_same_actor ) && {
			multipleActors: ! item.streams_have_same_actor,
		}
	);
}

// fromApi default export
export default makeJsonSchemaParser( apiResponseSchema, transformer );
