import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { SECTION_A8C_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';
import { getReaderTeams } from 'calypso/state/teams/selectors';

const A8CFollowing = ( props ) => {
	const { translate, teams } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_A8C_FOLLOWING, feedIds, feedUrls } ) );
	};

	return (
		<Stream { ...props } shouldCombineCards={ false }>
			<SectionHeader label={ translate( 'Followed A8C Sites' ) }>
				{ isEligibleForUnseen( { teams } ) && (
					<Button
						compact
						onClick={ () => markAllAsSeen( props.feedsInfo ) }
						disabled={ ! props.feedsInfo.unseenCount }
					>
						{ translate( 'Mark all as seen' ) }
					</Button>
				) }
			</SectionHeader>
		</Stream>
	);
};

export default connect( ( state ) => ( {
	teams: getReaderTeams( state ),
	feedsInfo: getReaderOrganizationFeedsInfo( state, AUTOMATTIC_ORG_ID ),
} ) )( localize( A8CFollowing ) );
