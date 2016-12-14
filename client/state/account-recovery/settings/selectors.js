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

export const getAccountRecoveryPhone = ( state ) => {
	return isAccountRecoverySettingsReady( state ) ? getSettingsData( state ).phone : null;
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
