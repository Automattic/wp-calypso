import getUI from './get-ui';

const getLayoutStyle = ( uiState ) => uiState.layoutStyle;

export default ( state ) => getLayoutStyle( getUI( state ) );
