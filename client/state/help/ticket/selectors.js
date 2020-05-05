export const isTicketSupportEligible = ( state ) => {
	return state.help.ticket.isUserEligible;
};

export const isTicketSupportConfigurationReady = ( state ) => {
	return state.help.ticket.isReady;
};

export const isRequestingTicketSupportConfiguration = ( state ) => {
	return state.help.ticket.isRequesting;
};

export const getTicketSupportRequestError = ( state ) => {
	return state.help.ticket.requestError;
};
