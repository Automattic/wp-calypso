import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderInfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import { SEARCH_RESULTS_SITES } from 'calypso/reader/follow-sources';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';

class SiteResults extends Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.string,
		searchResults: PropTypes.array,
		hasNextPage: PropTypes.bool,
		fetchNextPage: PropTypes.func,
		isLoggedIn: PropTypes.bool,
		width: PropTypes.number.isRequired,
	};

	handleLoadMore = ( offset ) => {
		if ( this.isLoginPromptVisible( offset ) ) {
			return;
		}

		this.props.fetchNextPage();
	};

	hasMore = ( offset ) => {
		if ( this.isLoginPromptVisible( offset ) ) {
			return false;
		}
		// Defer to the infinite query's own stop condition (driven by the
		// endpoint's `next_page` handle) rather than comparing the deduped offset
		// to the inflated ES `total`, which never resolves and leaves the stream
		// rendering permanent loading placeholders (READ-601).
		return Boolean( this.props.hasNextPage );
	};

	isLoginPromptVisible( offset ) {
		// Show login prompt for all logged out users after few posts.
		return ! this.props.isLoggedIn && offset > MAX_POSTS_FOR_LOGGED_OUT_USERS;
	}

	render() {
		const { query, searchResults, width } = this.props;
		const isEmpty = query?.length > 0 && searchResults?.length === 0;

		if ( isEmpty ) {
			return (
				<div className="search-stream__site-results-none">
					{ this.props.translate( 'No sites found.' ) }
				</div>
			);
		}

		return (
			<div>
				<ReaderInfiniteStream
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					width={ width }
					fetchNextPage={ this.handleLoadMore }
					hasNextPage={ this.hasMore }
					rowRenderer={ siteRowRenderer }
					extraRenderItemProps={ {
						showLastUpdatedDate: false,
						showNotificationSettings: false,
						showFollowedOnDate: false,
						followSource: SEARCH_RESULTS_SITES,
					} }
				/>
			</div>
		);
	}
}

export default localize( withDimensions( SiteResults ) );
