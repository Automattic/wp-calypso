import { Button } from '@automattic/components';
import { useTranslate, localize } from 'i18n-calypso';
import { useDispatch, useSelector, connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getOrganizationSites from 'calypso/state/reader/follows/selectors/get-reader-follows-organization';
import { P2_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { SECTION_P2_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';

function P2Following( props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const feedsInfo = useSelector( ( state ) => getReaderOrganizationFeedsInfo( state, P2_ORG_ID ) );

	const markAllAsSeen = () => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_P2_FOLLOWING, feedIds, feedUrls } ) );
	};

	return (
		<Stream { ...props } shouldCombineCards={ false }>
			<SectionHeader label={ translate( 'Followed P2 Sites' ) }>
				<Button compact onClick={ markAllAsSeen } disabled={ ! feedsInfo.unseenCount }>
					{ translate( 'Mark all as seen' ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
}

export default connect( ( state ) => {
	return {
		sites: getOrganizationSites( state, P2_ORG_ID ),
	};
} )( localize( P2Following ) );
