/**
 * External dependencies
 */
import wp from 'calypso/lib/wp';

/**
 * Internal dependencies
 */
import {
	saveUserSettingsFailure,
	saveUserSettingsSuccess,
} from 'calypso/state/user-settings/actions';
import { fromApi } from 'calypso/state/data-layer/wpcom/me/settings';
import { USER_SETTINGS_SAVE } from 'calypso/state/action-types';

const wpcom = wp.undocumented();

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
