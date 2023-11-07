import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { SECTION_A8C_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';

export default function A8CFollowing( props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const feedsInfo = useSelector( ( state ) =>
		getReaderOrganizationFeedsInfo( state, AUTOMATTIC_ORG_ID )
	);

	const markAllAsSeen = () => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_A8C_FOLLOWING, feedIds, feedUrls } ) );
	};

	return (
		<Stream { ...props }>
			<SectionHeader label={ translate( 'Followed A8C Sites' ) }>
				<Button compact onClick={ markAllAsSeen } disabled={ ! feedsInfo.unseenCount }>
					{ translate( 'Mark all as seen' ) }
				</Button>
				<Button primary compact className="following__manage" href="/following/manage">
					{ translate( 'Manage' ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
}
