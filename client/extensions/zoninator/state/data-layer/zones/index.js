/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import reduxFormActions from 'redux-form/es/actions';
import { reduce } from 'lodash';

const { initialize, startSubmit, stopSubmit } = reduxFormActions;

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { navigate } from 'state/ui/actions';
import { requestZones, requestError, updateZone, updateZones } from '../../zones/actions';
import { fromApi } from './utils';
import {
	ZONINATOR_ADD_ZONE,
	ZONINATOR_DELETE_ZONE,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_SAVE_ZONE,
} from 'zoninator/state/action-types';

const settingsPath = '/extensions/zoninator';

const saveZoneNotice = 'zoninator-zone-create';
const deleteZoneNotice = 'zoninator-zone-delete';

export const requestZonesList = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: '/zoninator/v1/zones',
				},
			},
			action
		)
	);
};

export const requestZonesError = ( { dispatch }, { siteId } ) => dispatch( requestError( siteId ) );

export const updateZonesList = ( { dispatch }, { siteId }, { data } ) =>
	dispatch(
		updateZones(
			siteId,
			reduce(
				data,
				( zones, rawZone ) => {
					const zone = fromApi( rawZone );
					zones[ zone.id ] = zone;
					return zones;
				},
				{}
			)
		)
	);

export const createZone = ( { dispatch }, action ) => {
	const { data, form, siteId } = action;

	dispatch( startSubmit( form ) );
	dispatch( removeNotice( saveZoneNotice ) );
	dispatch(
		http(
			{
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					body: JSON.stringify( data ),
					json: true,
					path: '/zoninator/v1/zones',
				},
			},
			action
		)
	);
};

export const saveZone = ( { dispatch }, action ) => {
	const { data, form, siteId, zoneId } = action;

	dispatch( startSubmit( form ) );
	dispatch( removeNotice( saveZoneNotice ) );
	dispatch(
		http(
			{
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					body: JSON.stringify( data ),
					json: true,
					path: `/zoninator/v1/zones/${ zoneId }&_method=PUT`,
				},
			},
			action
		)
	);
};

const announceZoneSaved = ( dispatch, { form, siteId }, zone ) => {
	dispatch( stopSubmit( form ) );
	dispatch( updateZone( siteId, zone.id, zone ) );
	dispatch( successNotice( translate( 'Zone saved!' ), { id: saveZoneNotice } ) );
};

export const handleZoneCreated = ( { dispatch }, action, response ) => {
	const zone = fromApi( response.data );

	dispatch( navigate( `${ settingsPath }/zone/${ action.siteSlug }/${ zone.id }` ) );
	announceZoneSaved( dispatch, action, zone );
};

export const handleZoneSaved = ( { dispatch }, action ) => {
	const { data, form } = action;

	dispatch( initialize( form, data ) );
	announceZoneSaved( dispatch, action, data );
};

export const announceSaveFailure = ( { dispatch }, { form } ) => {
	dispatch( stopSubmit( form ) );
	dispatch(
		errorNotice( translate( 'There was a problem saving the zone. Please try again.' ), {
			id: saveZoneNotice,
		} )
	);
};

export const deleteZone = ( { dispatch }, action ) => {
	const { siteId, zoneId } = action;

	dispatch( removeNotice( deleteZoneNotice ) );
	dispatch(
		http(
			{
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: `/zoninator/v1/zones/${ zoneId }&_method=DELETE`,
				},
			},
			action
		)
	);
};

export const announceZoneDeleted = ( { dispatch }, { siteId, siteSlug } ) => {
	dispatch( navigate( `${ settingsPath }/${ siteSlug }` ) );
	dispatch( requestZones( siteId ) );
	dispatch( successNotice( translate( 'The zone has been deleted.' ), { id: deleteZoneNotice } ) );
};

export const announceDeleteFailure = ( { dispatch } ) =>
	dispatch(
		errorNotice( translate( 'The zone could not be deleted. Please try again.' ), {
			id: deleteZoneNotice,
		} )
	);

const dispatchFetchZonesRequest = dispatchRequest(
	requestZonesList,
	updateZonesList,
	requestZonesError
);
const dispatchAddZoneRequest = dispatchRequest(
	createZone,
	handleZoneCreated,
	announceSaveFailure
);
const dispatchSaveZoneRequest = dispatchRequest( saveZone, handleZoneSaved, announceSaveFailure );
const dispatchDeleteZoneRequest = dispatchRequest(
	deleteZone,
	announceZoneDeleted,
	announceDeleteFailure
);

export default {
	[ ZONINATOR_REQUEST_ZONES ]: [ dispatchFetchZonesRequest ],
	[ ZONINATOR_ADD_ZONE ]: [ dispatchAddZoneRequest ],
	[ ZONINATOR_SAVE_ZONE ]: [ dispatchSaveZoneRequest ],
	[ ZONINATOR_DELETE_ZONE ]: [ dispatchDeleteZoneRequest ],
};
