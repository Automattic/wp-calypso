import getUI from './get-ui';

const getViews = ( uiState ) => uiState.views;

export default ( state ) => getViews( getUI( state ) );
