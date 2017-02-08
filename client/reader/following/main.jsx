/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import CompactCard from 'components/card/compact';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import { getABTestVariation } from 'lib/abtest';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query
	} );
	page( '/read/search?q=' + encodeURIComponent( query ) );
}

const shouldShowSearchOnFollowing = getABTestVariation( 'readerSearchOnFollowing' ) === 'show';

const FollowingStream = ( props ) => {
	return (
		<Stream { ...props }>
			{ shouldShowSearchOnFollowing &&
				<CompactCard className="following__search">
					<SearchInput
						onSearch={ handleSearch }
						autoFocus={ false }
						delaySearch={ true }
						delayTimeout={ 2000 }
						placeholder={ props.translate( 'Search billions of WordPress.com posts…' ) } />
				</CompactCard>
			}
			{ shouldShowSearchOnFollowing &&
				<hr className="search-stream__fixed-area-separator" />
			}
		</Stream>
	);
};

export default localize( FollowingStream );
