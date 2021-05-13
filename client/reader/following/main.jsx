/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { flatMap, trim } from 'lodash';
import { connect, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import BlankSuggestions from 'calypso/reader/components/reader-blank-suggestions';
import Stream from 'calypso/reader/stream';
import { CompactCard, Button } from '@automattic/components';
import SearchInput from 'calypso/components/search';
import { recordTrack } from 'calypso/reader/stats';
import Suggestion from 'calypso/reader/search-stream/suggestion';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import FollowingIntro from './intro';
import { getSearchPlaceholderText } from 'calypso/reader/search/utils';
import SectionHeader from 'calypso/components/section-header';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SECTION_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';

/**
 * Style dependencies
 */
import './style.scss';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query,
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

const FollowingStream = ( props ) => {
	const suggestionList =
		props.suggestions &&
		flatMap( props.suggestions, ( query ) => [
			<Suggestion suggestion={ query.text } source="following" railcar={ query.railcar } />,
			', ',
		] ).slice( 0, -1 );
	const placeholderText = getSearchPlaceholderText();
	const { translate, teams } = props;
	const dispatch = useDispatch();
	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_FOLLOWING, feedIds, feedUrls } ) );
	};
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			<FollowingIntro />
			<CompactCard className="following__search">
				<SearchInput
					onSearch={ handleSearch }
					delaySearch={ true }
					delayTimeout={ 500 }
					placeholder={ placeholderText }
				/>
			</CompactCard>
			<BlankSuggestions suggestions={ suggestionList } />
			<SectionHeader label={ translate( 'Followed Sites' ) }>
				{ isEligibleForUnseen( { teams } ) && (
					<Button
						compact
						onClick={ () => markAllAsSeen( props.feedsInfo ) }
						disabled={ ! props.feedsInfo.unseenCount }
					>
						{ translate( 'Mark all as seen' ) }
					</Button>
				) }
				<Button primary compact className="following__manage" href="/following/manage">
					{ translate( 'Manage' ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default connect( ( state ) => ( {
	teams: getReaderTeams( state ),
	feedsInfo: getReaderOrganizationFeedsInfo( state, NO_ORG_ID ),
} ) )( SuggestionProvider( localize( FollowingStream ) ) );
