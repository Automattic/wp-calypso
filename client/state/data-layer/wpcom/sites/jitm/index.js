/**
 * External Dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema.json';
import { clearJITM, insertJITM } from 'state/jitm/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JITM_DISMISS, JITM_FETCH } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

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
 * @param {object} jitms The jitms to display from the api
 * @returns {object} The transformed data to display
 */
const transformApiRequest = ( { data: jitms } ) =>
	jitms.map( ( jitm ) => ( {
		message: unescapeDecimalEntities( jitm.content.message || '' ),
		description: unescapeDecimalEntities( jitm.content.description || '' ),
		classes: unescapeDecimalEntities( jitm.content.classes || '' ),
		icon: unescapeDecimalEntities( jitm.content.icon || '' ),
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
	} ) );

/**
 * Processes the current state and determines if it should fire a jitm request
 *
 * @param {object} action The fetch action
 * @returns {object} The HTTP fetch action
 */
export const doFetchJITM = ( action ) => {
	return http(
		{
			apiNamespace: 'rest',
			method: 'GET',
			path: `/v1.1/jetpack-blogs/${ action.siteId }/rest-api/`,
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
 * @param {object} action The dismissal action
 * @returns {object} The HTTP fetch action
 */
export const doDismissJITM = ( action ) =>
	http(
		{
			apiNamespace: 'rest',
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
 * @param {object} action action object
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
 * @param {object} action action object
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
