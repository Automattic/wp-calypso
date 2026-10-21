import { wpcom } from '../wpcom-fetcher';

// A count of 9999 marks a note as read; the panel sends -1 to mark it unread.
export const markNotificationsRead = ( noteIds: number[] ): Promise< unknown > =>
	wpcom.req.post(
		{ path: '/notifications/read' },
		{ counts: Object.fromEntries( noteIds.map( ( id ) => [ id, 9999 ] ) ) }
	);
