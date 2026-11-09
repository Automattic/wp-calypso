import { notificationsQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';

// The inbox only maps note ids to comments and checks what's unread.
const COMMENT_NOTE_FIELDS = 'id,read,meta';

export function useCommentNotes( {
	enabled = true,
	refetchInterval,
}: {
	enabled?: boolean;
	refetchInterval?: number | false;
} = {} ) {
	const locale = useLocale();

	return useQuery( {
		...notificationsQuery( { type: 'comment', number: 100, fields: COMMENT_NOTE_FIELDS, locale } ),
		enabled,
		refetchInterval,
	} );
}
