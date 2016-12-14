export const isAccountRecoverySettingsReady = ( state ) => {
	return null != state.accountRecovery.settings.data;
};

const getSettingsData = ( state ) => {
	return state.accountRecovery.settings.data;
};

export const isAccountRecoveryPhoneValidated = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phoneValidated : false;
};

export const isAccountRecoveryEmailValidated = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).emailValidated : false;
};

export const getAccountRecoveryEmail = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).email : '';
};

export const getAccountRecoveryPhoneCountryCode = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phoneCountryCode : '';
};

export const getAccountRecoveryPhoneCountryNumericCode = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phoneCountryNumericCode : '';
};

export const getAccountRecoveryPhoneNumber = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phoneNumber : '';
};

export const getAccountRecoveryPhoneNumberFull = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phoneNumberFull : '';
};

export const isUpdatingAccountRecoveryPhone = ( state ) => {
	return !! state.accountRecovery.settings.isUpdating.phone;
};

export const isUpdatingAccountRecoveryEmail = ( state ) => {
	return !! state.accountRecovery.settings.isUpdating.email;
};

export const isDeletingAccountRecoveryPhone = ( state ) => {
	return !! state.accountRecovery.settings.isDeleting.phone;
};

export const isDeletingAccountRecoveryEmail = ( state ) => {
	return !! state.accountRecovery.settings.isDeleting.email;
};
