import getUI from './get-ui';

const getFilterName = ( uiState ) => uiState.filterName;

export default ( state ) => getFilterName( getUI( state ) );
