import debugFactory from 'debug';
import { get, isEmpty } from 'lodash';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import {
	removeUnsavedUserSetting,
	setUnsavedUserSetting,
} from 'calypso/state/user-settings/actions';

import 'calypso/state/user-settings/init';
import 'calypso/state/data-layer/wpcom/me/settings';

const debug = debugFactory( 'calypso:user:settings' );
/**
 * Checks if an incoming change to settings.language is a change to the existing settings
 * Currently the assumption is that if a settings.locale_variant slug exists, then that is the current language
 * @param  {string}  languageSettingValue the newly-set language slug string.
 * @param  {Object}  settings user settings object.
 * @returns {boolean} if the language setting has been changed.
 */
function hasLanguageChanged( languageSettingValue, settings = {} ) {
	if ( ! languageSettingValue ) {
		return false;
	}
	// if there is a saved variant we know that the user is changing back to the root language === setting hasn't changed
	// but if settings.locale_variant is not empty then we assume the user is trying to switch back to the root
	return (
		( languageSettingValue === settings.language && isEmpty( settings.locale_variant ) ) ||
		//if the incoming language code is the variant itself === setting hasn't changed
		languageSettingValue === settings.locale_variant
	);
}

/**
 * Split a path into an array.
 *
 * Example: Input of `calypso_preferences.preferenceName` results in `[ 'calypso_preferences', 'preferenceName' ]`
 * @param {string|Array} path Path to be split into an array
 */
function castPath( path ) {
	if ( Array.isArray( path ) ) {
		return path;
	}

	return path.split( '.' );
}

/**
 * Handles the storage and removal of changed setting that are pending
 * being saved to the WPCOM API.
 * @param  {string} settingName - setting name
 * @param  {*} value - setting value
 * @returns {Function} Action thunk that returns updating successful response
 */
export default function setUserSetting( settingName, value ) {
	return ( dispatch, getState ) => {
		const settings = getUserSettings( getState() );
		const settingPath = castPath( settingName );

		const originalSetting = get( settings, settingPath );

		if ( originalSetting === undefined ) {
			debug( settingName + ' does not exist in user-settings data module.' );
			return;
		}

		/*
		 * If the two match, we don't consider the setting "changed".
		 * - `user_login` is a special case since the logic for validating and saving a username
		 * is more complicated.
		 * - `language` is a special case since we have to check for changes
		 * to locale_variant this might be easier if we tracked the lang_id instead as we do in
		 * client/my-sites/site-settings/form-general.jsx
		 */
		const exceptions = [ 'user_login', 'language' ];
		const languageHasChanged = 'language' === settingName && hasLanguageChanged( value, settings );
		if (
			( originalSetting === value && ! exceptions.includes( settingName ) ) ||
			languageHasChanged
		) {
			debug( 'Removing ' + settingName + ' from changed settings.' );
			dispatch( removeUnsavedUserSetting( settingPath ) );
		} else {
			dispatch( setUnsavedUserSetting( settingPath, value ) );
		}
	};
}
