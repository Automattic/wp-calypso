import { markNotificationsReadMutation, notificationsQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const COMMENT_NOTE_FIELDS = 'id,type,read,body,subject,header,timestamp,meta,icon,title,noticon';

export function useCommentNotes() {
	const locale = useLocale();

	return useQuery(
		notificationsQuery( { type: 'comment', number: 100, fields: COMMENT_NOTE_FIELDS, locale } )
	);
}

export function useMarkNotesRead() {
	const queryClient = useQueryClient();

	return useMutation( markNotificationsReadMutation( queryClient ) );
}
