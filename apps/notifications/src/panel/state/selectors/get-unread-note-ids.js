import getNotes from './get-notes';

export const getUnreadNoteIds = ( notesState ) => notesState.unreadNoteIds;

export default ( state ) => getUnreadNoteIds( getNotes( state ) );
