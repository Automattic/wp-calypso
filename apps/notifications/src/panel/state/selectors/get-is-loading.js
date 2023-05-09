import getUi from './get-ui';

export const getIsLoading = ( uiState ) => uiState.isLoading;

export default ( state ) => getIsLoading( getUi( state ) );
