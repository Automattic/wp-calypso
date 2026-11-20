export type NotificationsPanelView = {
	filterName: string;
	noteId?: string;
};

/**
 * Returns the address of the notifications page for the panel's tab, with the panel's open note in the history state.
 */
export function getInboxLocation( { filterName, noteId }: NotificationsPanelView ) {
	return {
		to: '/notifications',
		search: { filter: filterName === 'all' ? undefined : filterName },
		state: { notificationsNoteId: noteId },
	};
}
