import getUi from './get-ui';

// The filter fragment whose fetch is currently loading (e.g. `{ unread: 1 }`),
// or null. See the `filteredLoading` reducer.
export const getFilteredLoading = ( uiState ) => uiState.filteredLoading;

export default ( state ) => getFilteredLoading( getUi( state ) );
