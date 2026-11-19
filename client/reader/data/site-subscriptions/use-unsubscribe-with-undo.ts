import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { useFollowSite, useUnfollowSite } from './use-follow-mutations';

const UNSUBSCRIBE_NOTICE_ID = 'reader-sidebar-unsubscribe-with-undo';

interface UnsubscribeWithUndoParams {
	feedUrl: string;
	siteName?: string;
	source?: string;
}

/**
 * Shows the unsubscribed notice whose Undo re-subscribes.
 */
export const useUnsubscribeUndoNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const { mutate: followSite } = useFollowSite();

	return ( { feedUrl, siteName, source }: UnsubscribeWithUndoParams ): void => {
		const target = { feedUrl };
		const eventProps = { feed_url: target.feedUrl, source };

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

/**
 * Unsubscribes from a site and offers an Undo in the success notice.
 */
export const useUnsubscribeWithUndo = () => {
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const { mutate: unfollowSite } = useUnfollowSite();
	const showUndoNotice = useUnsubscribeUndoNotice();

	return ( params: UnsubscribeWithUndoParams ): void => {
		recordReaderTracksEvent( 'calypso_reader_unsubscribe_clicked', {
			feed_url: params.feedUrl,
			source: params.source,
		} );
		unfollowSite( { feedUrl: params.feedUrl } );
		showUndoNotice( params );
	};
};
