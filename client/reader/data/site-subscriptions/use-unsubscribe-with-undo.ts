import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { useFollowSite, useUnfollowSite } from './use-follow-mutations';

const UNSUBSCRIBE_NOTICE_ID = 'reader-sidebar-unsubscribe-with-undo';

interface UnsubscribeWithUndoParams {
	feedUrl: string;
	blogId?: number;
	siteName?: string;
	source?: string;
}

/**
 * Unsubscribes from a site and offers an Undo in the success notice.
 */
export const useUnsubscribeWithUndo = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const { mutate: followSite } = useFollowSite();
	const { mutate: unfollowSite } = useUnfollowSite();

	return ( { feedUrl, blogId, siteName, source }: UnsubscribeWithUndoParams ): void => {
		const target = { feedUrl, blogId: blogId ?? undefined };
		const eventProps = { blog_id: target.blogId, feed_url: target.feedUrl, source };

		recordReaderTracksEvent( 'calypso_reader_unsubscribe_clicked', eventProps );
		unfollowSite( target );

		dispatch(
			successNotice(
				translate( 'Success! You are now unsubscribed from "%s".', { args: siteName || feedUrl } ),
				{
					id: UNSUBSCRIBE_NOTICE_ID,
					duration: 5000,
					button: translate( 'Undo' ) as string,
					onClick: () => {
						recordReaderTracksEvent( 'calypso_reader_unsubscribe_undo_clicked', eventProps );
						followSite( target );
						dispatch( removeNotice( UNSUBSCRIBE_NOTICE_ID ) );
					},
				}
			)
		);
	};
};
