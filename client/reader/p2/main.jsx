import { Button } from '@automattic/components';
import { fixMe, useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import { useMarkAllAsSeenMutation } from 'calypso/reader/data/seen-posts';
import { useOrganizationFeedsInfo } from 'calypso/reader/data/site-subscriptions';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { P2_ORG_ID } from 'calypso/state/reader/organizations/constants';

const STREAM_KEY = 'p2';

export default function P2Following( props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const feedsInfo = useOrganizationFeedsInfo( P2_ORG_ID );
	const { mutate: markAllAsSeen } = useMarkAllAsSeenMutation();

	const handleMarkAllAsSeen = () => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		markAllAsSeen( { identifier: STREAM_KEY, feedIds, feedUrls } );
	};

	return (
		<Stream { ...props }>
			<SectionHeader label={ translate( 'Followed P2 Sites' ) }>
				<Button compact onClick={ handleMarkAllAsSeen } disabled={ ! feedsInfo.unseenCount }>
					{ fixMe( {
						text: 'Mark all as read',
						newCopy: translate( 'Mark all as read' ),
						oldCopy: translate( 'Mark all as seen' ),
					} ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
}
