import config from '@automattic/calypso-config';
import moment from 'moment/moment';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { JITM_DISMISS, JITM_FETCH } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setJetpackConnectionMaybeUnhealthy } from 'calypso/state/jetpack-connection-health/actions';
import { clearJITM, insertJITM } from 'calypso/state/jitm/actions';
import getEnvStatsFeatureSupportChecksMemoized from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import schema from './schema.json';

const noop = () => {};
// Clean this up when we release a major version of Odyssey Stats e.g. v1.1.
const isRunningInLegacyJetpackSite =
	config.isEnabled( 'is_running_in_jetpack_site' ) &&
	! getEnvStatsFeatureSupportChecksMemoized( config( 'intial_state' ), config( 'blog_id' ) )
		.supportsWpcomV3Jitm;
const jitmSchema = ! isRunningInLegacyJetpackSite
	? schema
	: {
			$schema: 'http://json-schema.org/draft-04/schema#',
			properties: {
				data: {
					type: 'array',
					items: schema.items,
				},
			},
	  };

/**
 * Existing libraries do not escape decimal encoded entities that php encodes, this handles that.
 * @param {string} str The string to decode
 * @returns {string} The decoded string
 */
const unescapeDecimalEntities = ( str ) =>
	str.replace( /&#(\d+);/g, ( _, entity ) => String.fromCharCode( entity ) );

/**
 * Given an object from the api, prepare it to be consumed by the ui by transforming the shape of the data
 * @param {Object} jitms The response object from the jitms endpoint
 * @returns {Object} The transformed data to display
 */
export const transformApiRequest = ( jitms ) => {
	// Different shape of data between Calypso and Jetpack.
	if ( isRunningInLegacyJetpackSite && jitms && jitms.data ) {
		jitms = jitms.data;
	}
	return jitms.map( ( jitm ) => ( {
		message: unescapeDecimalEntities( jitm.content.message || '' ),
		description: unescapeDecimalEntities( jitm.content.description || '' ),
		classes: unescapeDecimalEntities( jitm.content.classes || '' ),
		icon: unescapeDecimalEntities( jitm.content.icon || '' ),
		iconPath: unescapeDecimalEntities( jitm.content.iconPath || '' ),
		featureClass: jitm.feature_class,
		CTA: {
			message: unescapeDecimalEntities( jitm.CTA.message ),
			link: unescapeDecimalEntities( jitm.CTA.link || jitm.url ),
			target: unescapeDecimalEntities(
				jitm.CTA.target || '' === jitm.CTA.target ? jitm.CTA.target : '_blank'
			),
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
};

/**
 * Processes the current state and determines if it should fire a jitm request
 * @param {Object} action The fetch action
 * @returns {Object} The HTTP fetch action
 */
export const doFetchJITM = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v3',
			path: config.isEnabled( 'is_running_in_jetpack_site' )
				? '/jitm'
				: `/sites/${ action.siteId }/jitm`,
			query: {
				message_path: action.messagePath,
				query: action.searchQuery,
				locale: action.locale,
			},
			isLocalApiCall: true, // required to use the wpcom/v3 namespace
		},
		{ ...action }
	);

/**
 * Dismisses a JITM
 * @param {Object} action The dismissal action
 * @returns {Object} The HTTP fetch action
 */
export const doDismissJITM = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v3',
			path: config.isEnabled( 'is_running_in_jetpack_site' )
				? '/jitm'
				: `/sites/${ action.siteId }/jitm`,
			body: {
				feature_class: action.featureClass,
				id: action.id,
			},
			isLocalApiCall: true, // required to use the wpcom/v3 namespace
		},
		action
	);

/**
 * Called when the http layer receives a valid jitm
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
 * @param {Object} action action object
 * @param {number} action.siteId The site id
 * @param {string} action.messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {Function} a handler for the failed request
 */
export const failedJITM = ( action ) => ( dispatch, getState ) => {
	const siteId = action.siteId || action.site_id || getSelectedSiteId( getState() );
	dispatch( setJetpackConnectionMaybeUnhealthy( siteId ) );
	dispatch( clearJITM( siteId, action.messagePath ) );
};

// Clean this up when we release a major version of Odyssey Stats e.g. v1.1.
const doJetpackFetchJITM = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'jetpack/v4',
			path: '/jitm',
			query: {
				message_path: action.messagePath,
				query: action.searchQuery,
			},
			locale: action.locale,
		},
		{ ...action }
	);

// Clean this up when we release a major version of Odyssey Stats e.g. v1.1.
const doJetpackDismissJITM = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'jetpack/v4',
			path: '/jitm',
			body: JSON.stringify( {
				feature_class: action.featureClass,
				id: action.id,
			} ),
			json: false,
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/jitm/index.js', {
	[ JITM_FETCH ]: [
		dispatchRequest( {
			fetch: ! isRunningInLegacyJetpackSite ? doFetchJITM : doJetpackFetchJITM,
			onSuccess: receiveJITM,
			onError: failedJITM,
			fromApi: makeJsonSchemaParser( jitmSchema, transformApiRequest ),
		} ),
	],

	[ JITM_DISMISS ]: [
		dispatchRequest( {
			fetch: ! isRunningInLegacyJetpackSite ? doDismissJITM : doJetpackDismissJITM,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
