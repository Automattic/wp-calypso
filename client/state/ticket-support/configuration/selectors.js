const defaultConfiguration = {
	isUserEligible: false,
};

export const getTicketSupportConfiguration = ( state ) => {
	return state.ticketSupport.configuration || defaultConfiguration;
};

export const isTicketSupportEligible = ( state ) => {
	return getTicketSupportConfiguration( state ).isUserEligible;
};
