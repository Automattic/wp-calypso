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
 * @param  {object} apiResponse                      API response body
 * @param  {array}  apiResponse.current.orderedItems Array of item objects
 * @return {array}                                   Array of proccessed item objects
 */
export function transformer( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return map( orderedItems, processItem );
}

/**
 * Description is an explanation of specific knowledge about an activity
 *
 * The description is a formatted explanation of an activity and may
 * contain links to resources referenced in the explanation
 *
 * @param {Object} item from API response
 * @returns {Object|undefined} parsed notifications-formatted block
 */
const getDescription = item => {
	// first generation had all of description in summary as string
	if ( ! item.content && ! item.formatted_content && 'string' === typeof item.summary ) {
		return parseBlock( { text: item.summary } );
	}

	// second generation had notes-formatted block as summary
	if ( 'string' !== typeof item.summary ) {
		return parseBlock( item.summary );
	}

	// third generation had either title as plaintext summary or in formatted content
	if ( item.formatted_content ) {
		return parseBlock( item.formatted_content.content );
	}

	if ( item.content ) {
		return parseBlock( item.content );
	}

	return undefined;
};

/**
 * Title is a terse and generic summary of the kind of activity
 *
 * Usually this includes a noun and a verb acting on that noun
 * e.g. "Post published" "Theme updated" "Plugin installed" etc…
 *
 * @param {Object} item from API response
 * @returns {String|undefined} activity title
 */
const getTitle = item => {
	// third generation provided title
	if ( item.formatted_content ) {
		return item.formatted_content.name;
	}

	if ( item.content && 'string' === typeof item.summary ) {
		return item.summary;
	}

	// first and second generations provided no title
	return undefined;
};

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
		activityIsRewindable: item.is_rewindable,
		rewindId: item.rewind_id,
		activityName: item.name,
		activityStatus: item.status,
		activityTargetTs: get( item, 'object.target_ts', undefined ),
		activityTitle: getTitle( item ),
		activityTs: Date.parse( published ),
		activityDescription: getDescription( item ),
	};
}

// fromApi default export
export default makeParser( apiResponseSchema, {}, transformer );
