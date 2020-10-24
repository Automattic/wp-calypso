/**
 * Internal dependencies
 */
import {
	WORDADS_SETTINGS_RECEIVE,
	WORDADS_SETTINGS_REQUEST,
	WORDADS_SETTINGS_SAVE,
	WORDADS_SETTINGS_SAVE_FAILURE,
	WORDADS_SETTINGS_SAVE_SUCCESS,
	WORDADS_SETTINGS_UPDATE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/wordads/settings';
import 'calypso/state/wordads/init';

/**
 * Returns an action object, signalling that WordAds settings for a site have been requested.
 *
 * @param   {number} siteId Site ID
 * @returns {object}        Action object
 */
export function requestWordadsSettings( siteId ) {
	return {
		type: WORDADS_SETTINGS_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object, signalling that WordAds settings for a site have been received.
 *
 * @param   {number} siteId   Site ID
 * @param   {object} settings The received WordAds settings
 * @returns {object}          Action object
 */
export function receiveWordadsSettings( siteId, settings ) {
	return {
		type: WORDADS_SETTINGS_RECEIVE,
		siteId,
		settings,
	};
}

/**
 * Returns an action object, signalling that WordAds settings for a site are being saved.
 *
 * @param   {number} siteId   Site ID
 * @param   {object} settings The new WordAds settings
 * @returns {object}          Action object
 */
export function saveWordadsSettings( siteId, settings ) {
	return {
		type: WORDADS_SETTINGS_SAVE,
		siteId,
		settings,
	};
}

/**
 * Returns an action object, signalling that WordAds settings for a site were successfully saved.
 *
 * @param   {number} siteId   Site ID
 * @returns {object}          Action object
 */
export function saveWordadsSettingsSuccess( siteId ) {
	return {
		type: WORDADS_SETTINGS_SAVE_SUCCESS,
		siteId,
	};
}

/**
 * Returns an action object, signalling that WordAds settings for a site failed to save.
 *
 * @param   {number} siteId   Site ID
 * @returns {object}          Action object
 */
export function saveWordadsSettingsFailure( siteId ) {
	return {
		type: WORDADS_SETTINGS_SAVE_FAILURE,
		siteId,
	};
}

/**
 * Returns an action object, signalling that WordAds settings for a site have been updated.
 *
 * @param   {number} siteId   Site ID
 * @param   {object} settings The updated WordAds settings
 * @returns {object}          Action object
 */
export function updateWordadsSettings( siteId, settings ) {
	return {
		type: WORDADS_SETTINGS_UPDATE,
		siteId,
		settings,
	};
}
