export type NotificationsPanelView = {
	filterName: string;
	noteId?: string;
};

/**
 * Returns the address of the notifications page for what the panel is showing.
 */
export function getInboxLocation( { filterName, noteId }: NotificationsPanelView ) {
	const search = { filter: filterName === 'all' ? undefined : filterName };

	return noteId
		? { to: '/notifications/$noteId', params: { noteId }, search }
		: { to: '/notifications', search };
}
