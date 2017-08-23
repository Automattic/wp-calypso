/**
 * External dependencies
 */
import page from 'page';
import { translate } from 'i18n-calypso';
import { startSubmit, stopSubmit } from 'redux-form';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { getSiteSlug } from 'state/sites/selectors';
import { requestError, updateZone, updateZones } from '../../zones/actions';
import { fromApi } from './utils';
import { ZONINATOR_REQUEST_ZONES, ZONINATOR_ADD_ZONE } from 'zoninator/state/action-types';

export const requestZonesList = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/zoninator/v1/zones',
		},
	}, action ) );
};

export const requestZonesError = ( { dispatch }, { siteId } ) =>
	dispatch( requestError( siteId ) );

export const updateZonesList = ( { dispatch }, { siteId }, { data } ) =>
	dispatch( updateZones( siteId, map( data, fromApi ) ) );

export const createZone = ( { dispatch }, action ) => {
	const { data, form, siteId } = action;

	dispatch( startSubmit( form ) );
	dispatch( removeNotice( 'zoninator-zone-create' ) );
	dispatch( http( {
		method: 'POST',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			body: JSON.stringify( data ),
			json: true,
			path: '/zoninator/v1/zones',
		},
	}, action ) );
};

export const announceZoneSaved = ( dispatch, { form, siteId }, data ) => {
	dispatch( stopSubmit( form ) );
	dispatch( updateZone( siteId, fromApi( data ) ) );
	dispatch( successNotice(
		translate( 'Zone saved!' ),
		{ id: 'zoninator-zone-create' },
	) );
};

export const announceZoneCreated = ( { dispatch, getState }, action, response ) => {
	const { siteId } = action;

	page( `/extensions/zoninator/${ getSiteSlug( getState(), siteId ) }` );
	announceZoneSaved( dispatch, action, response.data );
};

export const announceFailure = ( { dispatch }, { form } ) => {
	dispatch( stopSubmit( form ) );
	dispatch( errorNotice(
		translate( 'There was a problem saving the zone. Please try again.' ),
		{ id: 'zoninator-zone-create' },
	) );
};

const dispatchFetchZonesRequest = dispatchRequest( requestZonesList, updateZonesList, requestZonesError );
const dispatchAddZoneRequest = dispatchRequest( createZone, announceZoneCreated, announceFailure );

export default {
	[ ZONINATOR_REQUEST_ZONES ]: [ dispatchFetchZonesRequest ],
	[ ZONINATOR_ADD_ZONE ]: [ dispatchAddZoneRequest ],
};
