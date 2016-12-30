export const isAccountRecoverySettingsReady = ( state ) => {
	return state.accountRecovery.settings.isReady;
};

export const isAccountRecoveryPhoneValidated = ( state ) => {
	return state.accountRecovery.settings.data.phoneValidated;
};

export const isAccountRecoveryEmailValidated = ( state ) => {
	return state.accountRecovery.settings.data.emailValidated;
};

export const getAccountRecoveryEmail = ( state ) => {
	return state.accountRecovery.settings.data.email;
};

export const getAccountRecoveryPhone = ( state ) => {
	return state.accountRecovery.settings.data.phone;
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

export const isAccountRecoveryEmailActionInProgress = ( state ) => {
	return ! isAccountRecoverySettingsReady( state ) || isUpdatingAccountRecoveryEmail( state ) || isDeletingAccountRecoveryEmail( state );
};

export const isAccountRecoveryPhoneActionInProgress = ( state ) => {
	return ! isAccountRecoverySettingsReady( state ) || isUpdatingAccountRecoveryPhone( state ) || isDeletingAccountRecoveryPhone( state );
};
