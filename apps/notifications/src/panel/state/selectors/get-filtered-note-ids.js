import getNotes from './get-notes';

export const getFilteredNoteIds = ( notesState ) => notesState.filteredNoteIds;

export default ( state ) => getFilteredNoteIds( getNotes( state ) );
