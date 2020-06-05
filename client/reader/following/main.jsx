/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { initial, flatMap, trim } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import config from 'config';

/**
 * Internal dependencies
 */
import BlankSuggestions from 'reader/components/reader-blank-suggestions';
import Stream from 'reader/stream';
import { CompactCard, Button } from '@automattic/components';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import Suggestion from 'reader/search-stream/suggestion';
import SuggestionProvider from 'reader/search-stream/suggestion-provider';
import FollowingIntro from './intro';
import { getSearchPlaceholderText } from 'reader/search/utils';
import Banner from 'components/banner';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import SectionHeader from 'components/section-header';
import { requestMarkAllAsSeenSection } from 'state/reader/seen-posts/actions';
import { SECTION_FOLLOWING } from 'state/reader/seen-posts/constants';
import { getReaderOrganizationFeedsInfo } from 'state/reader/organizations/selectors';
import { NO_ORG_ID } from 'state/reader/organizations/constants';

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

const lastDayForVoteBanner = new Date( '2018-11-07T00:00:00' );

const FollowingStream = ( props ) => {
	const suggestionList =
		props.suggestions &&
		initial(
			flatMap( props.suggestions, ( query ) => [
				<Suggestion suggestion={ query.text } source="following" railcar={ query.railcar } />,
				', ',
			] )
		);
	const placeholderText = getSearchPlaceholderText();
	const now = new Date();
	const showRegistrationMsg = props.userInUSA && now < lastDayForVoteBanner;
	const { translate } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( requestMarkAllAsSeenSection( { identifier: SECTION_FOLLOWING, feedIds, feedUrls } ) );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			{ ! showRegistrationMsg && <FollowingIntro /> }
			{ showRegistrationMsg && (
				<Banner
					className="following__reader-vote"
					title="Election Day: Tuesday November 6th"
					callToAction="How to vote"
					description="Remember to vote."
					dismissPreferenceName="reader-vote-prompt"
					event="reader-vote-prompt"
					href="https://www.usa.gov/election-office"
					icon="star"
					horizontal
				/>
			) }
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
				{ config.isEnabled( 'reader/seen-posts' ) && (
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
	userInUSA: getCurrentUserCountryCode( state ) === 'US',
	feedsInfo: getReaderOrganizationFeedsInfo( state, NO_ORG_ID ),
} ) )( SuggestionProvider( localize( FollowingStream ) ) );
