import { get } from 'lodash';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { parseBlock } from 'calypso/lib/notifications/note-block-parser';
import apiResponseSchema from './schema';

/**
 * Module constants
 */
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 * @param  {Object} apiResponse API response body
 * @returns {Object}             Object with an entry for proccessed item objects and another for oldest item timestamp
 */
export function transformer( apiResponse ) {
	return get( apiResponse, [ 'current', 'orderedItems' ], [] ).map( processItem );
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 * @param  {Object}  item Validated Activity item
 * @returns {Object}       Processed Activity item ready for use in UI
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
		case 'rewind__backup_only_error':
			if ( '3' === get( item.object, 'error_code', '' ) ) {
				activityMeta.errorCode = 'not_accessible';
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
			baseRewindId: item.base_rewind_id,
			rewindStepCount: item.rewind_step_count,
		},
		item.rewind_id && { rewindId: item.rewind_id },
		item.status && { activityStatus: item.status },
		object && object.target_ts && { activityTargetTs: object.target_ts },
		object && object.type && { activityType: object.type },
		object && object.backup_warnings && { activityWarnings: JSON.parse( object.backup_warnings ) },
		object && object.backup_errors && { activityErrors: JSON.parse( object.backup_errors ) },
		item.is_aggregate && { isAggregate: item.is_aggregate },
		item.streams && { streams: item.streams.map( processItem ) },
		item.stream_count && { streamCount: item.stream_count },
		item.first_published && { firstPublishedDate: item.first_published },
		item.last_published && { lastPublishedDate: item.last_published },
		typeof item.streams_have_same_actor !== 'undefined' && {
			multipleActors: ! item.streams_have_same_actor,
		}
	);
}

const activityLogSchema = makeJsonSchemaParser( apiResponseSchema, transformer );
const activitySchema = makeJsonSchemaParser(
	apiResponseSchema.definitions.singleActivityRequest,
	processItem
);

// fromApi default export
export { activityLogSchema as default, activitySchema as fromActivityApi };
