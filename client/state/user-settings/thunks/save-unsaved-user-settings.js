/**
 * Internal dependencies
 */
import { fromApi } from 'calypso/state/data-layer/wpcom/me/settings';
import {
	clearUnsavedUserSettings,
	saveUserSettingsSuccess,
} from 'calypso/state/user-settings/actions';
import wp from 'calypso/lib/wp';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';

const wpcom = wp.undocumented();

/**
 * Redux thunk which exclusively updates given unsaved user settings
 *
 * @param {Array} fields Array of keys to be saved from unsaved user settings
 */
const saveUnsavedUserSettings = ( fields = [] ) => async ( dispatch, getState ) => {
	const unsavedUserSettings = getUnsavedUserSettings( getState() );

	const settingsToSave = fields.reduce( ( obj, attr ) => {
		if ( unsavedUserSettings[ attr ] !== undefined ) {
			obj[ attr ] = unsavedUserSettings[ attr ];
		}
		return obj;
	}, {} );

	const response = await wpcom.me().settings().update( settingsToSave );
	dispatch( saveUserSettingsSuccess( fromApi( response ) ) );
	dispatch( clearUnsavedUserSettings( fields ) );

	return response;
};

export default saveUnsavedUserSettings;
