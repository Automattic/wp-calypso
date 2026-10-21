import getUi from './get-ui';

// The name of the tab whose filtered fetch is currently loading (e.g. `'unread'`),
// or null. See the `filteredLoading` reducer.
export const getFilteredLoading = ( uiState ) => uiState.filteredLoading;

export default ( state ) => getFilteredLoading( getUi( state ) );
