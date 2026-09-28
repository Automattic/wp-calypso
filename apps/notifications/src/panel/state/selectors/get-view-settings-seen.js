import getUI from './get-ui';

const getViewSettingsSeen = ( uiState ) => uiState.viewSettingsSeen;

export default ( state ) => getViewSettingsSeen( getUI( state ) );
