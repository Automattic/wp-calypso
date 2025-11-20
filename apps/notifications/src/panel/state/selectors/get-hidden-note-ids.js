import getNotes from './get-notes';

export const getHiddenNoteIds = ( notesState ) => notesState.hiddenNoteIds;

export default ( state ) => getHiddenNoteIds( getNotes( state ) );
