/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { initial, flatMap, trim } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import FollowingIntro from './intro';
import CompactCard from 'components/card/compact';
import SearchInput from 'components/search';
import config from 'config';
import Suggestion from 'reader/search-stream/suggestion';
import SuggestionProvider from 'reader/search-stream/suggestion-provider';
import { recordTrack } from 'reader/stats';
import Stream from 'reader/stream';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query,
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

const FollowingStream = props => {
	const suggestionList =
		props.suggestions &&
		initial(
			flatMap( props.suggestions, query => [
				<Suggestion suggestion={ query.text } source="following" railcar={ query.railcar } />,
				', ',
			] )
		);

	return (
		<Stream { ...props }>
			{ config.isEnabled( 'reader/following-intro' ) && <FollowingIntro /> }
			<CompactCard className="following__search">
				<SearchInput
					onSearch={ handleSearch }
					autoFocus={ false }
					delaySearch={ true }
					delayTimeout={ 500 }
					placeholder={ props.translate( 'Search billions of WordPress.com posts…' ) }
				/>
			</CompactCard>
			<div className="search-stream__blank-suggestions">
				{ suggestionList &&
					props.translate( 'Suggestions: {{suggestions /}}.', {
						components: {
							suggestions: suggestionList,
						},
					} ) }&nbsp;
			</div>
		</Stream>
	);
};

export default SuggestionProvider( localize( FollowingStream ) );
