import { CompactCard, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { trim } from 'lodash';
import page from 'page';
import SearchInput from 'calypso/components/search';
import SectionHeader from 'calypso/components/section-header';
import BlankSuggestions from 'calypso/reader/components/reader-blank-suggestions';
import Suggestion from 'calypso/reader/search-stream/suggestion';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import { getSearchPlaceholderText } from 'calypso/reader/search/utils';
import { recordTrack } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import FollowingIntro from './intro';
import './style.scss';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query,
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

function FollowingStream( { suggestions, ...props } ) {
	const translate = useTranslate();

	const suggestionList =
		suggestions &&
		suggestions
			.flatMap( ( query ) => [
				<Suggestion
					key={ query.railcar.railcar }
					suggestion={ query.text }
					source="following"
					railcar={ query.railcar }
				/>,
				', ',
			] )
			.slice( 0, -1 );
	const placeholderText = getSearchPlaceholderText();

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
				<Button primary compact className="following__manage" href="/following/manage">
					{ translate( 'Manage' ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
