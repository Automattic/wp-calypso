import moment from 'moment/moment';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { JITM_DISMISS, JITM_FETCH } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { clearJITM, insertJITM } from 'calypso/state/jitm/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import schema from './schema.json';

const noop = () => {};

/**
 * Existing libraries do not escape decimal encoded entities that php encodes, this handles that.
 *
 * @param {string} str The string to decode
 * @returns {string} The decoded string
 */
const unescapeDecimalEntities = ( str ) =>
	str.replace( /&#(\d+);/g, ( _, entity ) => String.fromCharCode( entity ) );

/**
 * Given an object from the api, prepare it to be consumed by the ui by transforming the shape of the data
 *
 * @param {Object} response The response object from the jitms endpoint
 * @param {Object} response.data The jitms to display from the api
 * @returns {Object} The transformed data to display
 */
const transformApiRequest = ( { data: jitms } ) =>
	jitms.map( ( jitm ) => ( {
		message: unescapeDecimalEntities( jitm.content.message || '' ),
		description: unescapeDecimalEntities( jitm.content.description || '' ),
		classes: unescapeDecimalEntities( jitm.content.classes || '' ),
		icon: unescapeDecimalEntities( jitm.content.icon || '' ),
		iconPath: unescapeDecimalEntities( jitm.content.iconPath || '' ),
		featureClass: jitm.feature_class,
		CTA: {
			message: unescapeDecimalEntities( jitm.CTA.message ),
			link: unescapeDecimalEntities( jitm.CTA.link || '' ),
		},
		tracks: jitm.tracks,
		action: jitm.action,
		template: jitm.template,
		id: jitm.id,
		isDismissible: jitm.is_dismissible,
		messageExpiration: jitm.message_expiration ? moment( jitm.message_expiration ) : null,
		title: unescapeDecimalEntities( jitm.content.title || '' ),
		disclaimer: jitm.content.disclaimer.map( unescapeDecimalEntities ),
	} ) );

/**
 * Processes the current state and determines if it should fire a jitm request
 *
 * @param {Object} action The fetch action
 * @returns {Object} The HTTP fetch action
 */
export const doFetchJITM = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				path: '/jetpack/v4/jitm',
				query: JSON.stringify( {
					message_path: action.messagePath,
				} ),
				http_envelope: 1,
				locale: action.locale,
			},
		},
		{ ...action }
	);
};

/**
 * Dismisses a jitm on the jetpack site, it returns nothing useful and will return no useful error, so we'll
 * fail and succeed silently.
 *
 * @param {Object} action The dismissal action
 * @returns {Object} The HTTP fetch action
 */
export const doDismissJITM = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				path: '/jetpack/v4/jitm',
				body: JSON.stringify( {
					feature_class: action.featureClass,
					id: action.id,
				} ),
				http_envelope: 1,
				json: false,
			},
		},
		action
	);

/**
 * Called when the http layer receives a valid jitm
 *
 * @param {Object} action action object
 * @param {number} action.siteId The site id
 * @param {string} action.messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @param {Array} jitms The jitms
 * @returns {Function} a handler for the request
 */
export const receiveJITM = ( action, jitms ) => ( dispatch, getState ) => {
	const siteId = action.siteId || action.site_id || getSelectedSiteId( getState() );
	dispatch( insertJITM( siteId, action.messagePath, jitms ) );
};

/**
 * Called when a jitm fails for any network related reason
 *
 * @param {Object} action action object
 * @param {number} action.siteId The site id
 * @param {string} action.messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {Function} a handler for the failed request
 */
export const failedJITM = ( action ) => ( dispatch, getState ) => {
	const siteId = action.siteId || action.site_id || getSelectedSiteId( getState() );
	dispatch( clearJITM( siteId, action.messagePath ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/jitm/index.js', {
	[ JITM_FETCH ]: [
		dispatchRequest( {
			fetch: doFetchJITM,
			onSuccess: receiveJITM,
			onError: failedJITM,
			fromApi: makeJsonSchemaParser( schema, transformApiRequest ),
		} ),
	],

	[ JITM_DISMISS ]: [
		dispatchRequest( {
			fetch: doDismissJITM,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
