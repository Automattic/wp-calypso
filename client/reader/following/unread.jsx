/**
 * External dependencies
 */
import { CompactCard, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flatMap, trim } from 'lodash';
import page from 'page';
import { connect, useDispatch } from 'react-redux';
/**
 * Internal dependencies
 */
import SearchInput from 'calypso/components/search';
import SectionHeader from 'calypso/components/section-header';
import BlankSuggestions from 'calypso/reader/components/reader-blank-suggestions';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import Suggestion from 'calypso/reader/search-stream/suggestion';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import { getSearchPlaceholderText } from 'calypso/reader/search/utils';
import { recordTrack } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { SECTION_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import FollowingIntro from './intro';

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
		<Stream { ...props } includeSeenPosts={ false }>
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
