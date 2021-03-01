/**
 * Internal dependencies
 */
import { fromApi } from 'calypso/state/data-layer/wpcom/me/settings';
import {
	saveUserSettingsFailure,
	saveUserSettingsSuccess,
} from 'calypso/state/user-settings/actions';
import { USER_SETTINGS_SAVE } from 'calypso/state/action-types';
import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

/**
 * Redux thunk which exclusively updates `countryCode` and `phoneNumber` settings
 * required for Two-factor-authentication.
 *
 * Note: We purposely re-throw the error because we only catch it to handle the
 * `fetching` state with `saveUserSettingsFailure`.
 *
 * @param {string} countryCode Holds a country code
 * @param {string} phoneNumber Holds a phone number
 */
const saveTwoStepSMSSettings = ( countryCode, phoneNumber ) => async ( dispatch ) => {
	dispatch( { type: USER_SETTINGS_SAVE } );

	const settings = {
		two_step_sms_country: countryCode,
		two_step_sms_phone_number: phoneNumber,
	};

	try {
		const response = await wpcom.me().settings().update( settings );
		dispatch( saveUserSettingsSuccess( fromApi( response ) ) );
	} catch ( err ) {
		dispatch( saveUserSettingsFailure( settings, err ) );
		throw err;
	}
};

export default saveTwoStepSMSSettings;
