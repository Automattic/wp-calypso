import getUi from './get-ui';

// Whether the tab's first load failed and nothing has loaded since. See the
// `loadFailed` reducer.
export const hasLoadFailed = ( uiState, filterName ) => !! uiState.loadFailed[ filterName ];

export default ( state, filterName ) => hasLoadFailed( getUi( state ), filterName );
