export const defaultConfiguration = {
	isUserEligible: false,
};

export const getTicketSupportConfiguration = ( state ) => {
	return state.ticketSupport.configuration || defaultConfiguration;
};

export const isTicketSupportEligible = ( state ) => {
	return getTicketSupportConfiguration( state ).isUserEligible;
};

export const isTicketSupportConfigurationReady = ( state ) => {
	return null !== state.ticketSupport.configuration;
};
