/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { initial, flatMap, trim } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import config from 'calypso/config';

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
import Banner from 'calypso/components/banner';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import SectionHeader from 'calypso/components/section-header';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { SECTION_FOLLOWING } from 'calypso/state/reader/seen-posts/constants';
import { getReaderOrganizationFeedsInfo } from 'calypso/state/reader/organizations/selectors';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';

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

const hideVoteBannerDate = new Date( '2020-10-17T19:00:00' );

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
	const showRegistrationMsg = props.userInNZ && now < hideVoteBannerDate;
	const { translate } = props;
	const dispatch = useDispatch();

	const markAllAsSeen = ( feedsInfo ) => {
		const { feedIds, feedUrls } = feedsInfo;
		dispatch( requestMarkAllAsSeen( { identifier: SECTION_FOLLOWING, feedIds, feedUrls } ) );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			{ ! showRegistrationMsg && <FollowingIntro /> }
			{ showRegistrationMsg && (
				<Banner
					className="following__reader-vote"
					title="NZ Election Day: Saturday 17 October"
					callToAction="How to vote"
					description="You can vote from 3 October to election day, 17 October."
					event="reader-vote-prompt"
					href="https://vote.nz/"
					icon="star"
					horizontal
					target="_blank"
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
	userInNZ: getCurrentUserCountryCode( state ) === 'NZ',
	feedsInfo: getReaderOrganizationFeedsInfo( state, NO_ORG_ID ),
} ) )( SuggestionProvider( localize( FollowingStream ) ) );
