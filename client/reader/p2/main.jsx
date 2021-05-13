/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import Stream from 'calypso/reader/stream';
import { Button } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SECTION_P2_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';
import { P2_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';

const P2Following = ( props ) => {
	const { translate } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_P2_FOLLOWING, feedIds, feedUrls } ) );
	};

	return (
		<Stream { ...props } shouldCombineCards={ false }>
			<SectionHeader label={ translate( 'Followed P2 Sites' ) }>
				{ config.isEnabled( 'reader/seen-posts' ) && (
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
	feedsInfo: getReaderOrganizationFeedsInfo( state, P2_ORG_ID ),
} ) )( localize( P2Following ) );
