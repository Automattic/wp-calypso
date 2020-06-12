/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import config from 'config';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import { Button } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { requestMarkAllAsSeenSection } from 'state/reader/seen-posts/actions';
import { SECTION_A8C_FOLLOWING } from 'state/reader/seen-posts/constants';
import { AUTOMATTIC_ORG_ID } from 'state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'state/reader/organizations/selectors';

const A8CFollowing = ( props ) => {
	const { translate } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch(
			requestMarkAllAsSeenSection( { identifier: SECTION_A8C_FOLLOWING, feedIds, feedUrls } )
		);
	};

	return (
		<Stream { ...props } shouldCombineCards={ false }>
			<SectionHeader label={ translate( 'Followed A8C Sites' ) }>
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
	feedsInfo: getReaderOrganizationFeedsInfo( state, AUTOMATTIC_ORG_ID ),
} ) )( localize( A8CFollowing ) );
