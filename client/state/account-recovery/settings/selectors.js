const isSettingsExist = ( state ) => {
	return null == state.accountRecovery.settings;
};

const getSettingsData = ( state ) => {
	return state.accountRecovery.settings.data;
};

export const isAccountRecoveryPhoneValidated = ( state ) => {
	return isSettingsExist( state ) ? false : getSettingsData( state ).phoneValidated;
};

export const isAccountRecoveryEmailValidated = ( state ) => {
	return isSettingsExist( state ) ? false : getSettingsData( state ).emailValidated;
};

export const getAccountRecoveryEmail = ( state ) => {
	return isSettingsExist( state ) ? '' : getSettingsData( state ).email;
};

export const getAccountRecoveryPhoneCountryCode = ( state ) => {
	return isSettingsExist( state ) ? '' : getSettingsData( state ).phoneCountryCode;
};

export const getAccountRecoveryPhoneCountryNumericCode = ( state ) => {
	return isSettingsExist( state ) ? '' : getSettingsData( state ).phoneCountryNumericCode;
};

export const getAccountRecoveryPhoneNumber = ( state ) => {
	return isSettingsExist( state ) ? '' : getSettingsData( state ).phoneNumber;
};

export const getAccountRecoveryPhoneNumberFull = ( state ) => {
	return isSettingsExist( state ) ? '' : getSettingsData( state ).phoneNumberFull;
};
