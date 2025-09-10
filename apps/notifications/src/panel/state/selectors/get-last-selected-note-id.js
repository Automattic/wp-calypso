import getUI from './get-ui';

export const getLastSelectedNoteId = ( uiState ) => uiState.lastSelectedNoteId;

export default ( state ) => getLastSelectedNoteId( getUI( state ) );
