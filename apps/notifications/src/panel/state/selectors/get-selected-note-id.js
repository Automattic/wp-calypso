import getUI from './get-ui';

export const getSelectedNoteId = ( uiState ) => uiState.selectedNoteId;

export default ( state ) => getSelectedNoteId( getUI( state ) );
