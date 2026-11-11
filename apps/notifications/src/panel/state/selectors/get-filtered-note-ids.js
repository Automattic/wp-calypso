import getNotes from './get-notes';

// The cached id list for `filterKey`, or undefined if that tab was never fetched.
export const getFilteredNoteIds = ( notesState, filterKey ) =>
	notesState.filteredNoteIds[ filterKey ];

export default ( state, filterKey ) => getFilteredNoteIds( getNotes( state ), filterKey );
