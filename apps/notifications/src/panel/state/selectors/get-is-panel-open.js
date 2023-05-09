import getUI from './get-ui';

const getIsPanelOpen = ( uiState ) => uiState.isPanelOpen;

export default ( state ) => getIsPanelOpen( getUI( state ) );
