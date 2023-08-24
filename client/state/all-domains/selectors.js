export const getCurrentNavigationPage = ( state ) => {
	return state.allDomains.navigation.currentPage || 1;
};
