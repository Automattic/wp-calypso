/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { take, times } from 'lodash';
import Gridicon from 'components/gridicon';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ReaderSubscriptionListItemPlaceholder from 'blocks/reader-subscription-list-item/placeholder';
import { READER_FOLLOWING_MANAGE_SEARCH_RESULT } from 'reader/follow-sources';
import InfiniteStream from 'reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'reader/components/reader-infinite-stream/row-renderers';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';

class FollowingManageSearchFeedsResults extends React.Component {
	static propTypes = {
		query: PropTypes.string.isRequired,
		showMoreResults: PropTypes.bool,
		onShowMoreResultsClicked: PropTypes.func,
		searchResults: PropTypes.array,
		searchResultsCount: PropTypes.number,
		translate: PropTypes.func,
		width: PropTypes.number,
	};

	hasNextPage = ( offset ) => {
		if ( this.props.showMoreResults ) {
			return offset < this.props.searchResultsCount;
		}
		return false;
	};

	fetchNextPage = ( offset ) =>
		this.props.requestFeedSearch( {
			query: this.props.query,
			offset,
			excludeFollowed: true,
		} );

	render() {
		const {
			showMoreResults,
			onShowMoreResultsClicked,
			searchResults,
			translate,
			width,
			searchResultsCount,
			query,
		} = this.props;
		const isEmpty = !! ( query && query.length > 0 && searchResults && searchResults.length === 0 );
		const classNames = classnames( 'following-manage__search-results', {
			'is-empty': isEmpty,
		} );

		if ( ! searchResults ) {
			return (
				<div className={ classNames }>
					{ times( 10, ( i ) => (
						<ReaderSubscriptionListItemPlaceholder key={ `placeholder-${ i }` } />
					) ) }
				</div>
			);
		} else if ( isEmpty ) {
			return (
				<div className={ classNames }>
					{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: query,
					} ) }
				</div>
			);
		}

		return (
			<div className={ classNames }>
				<InfiniteStream
					extraRenderItemProps={ {
						showLastUpdatedDate: false,
						followSource: READER_FOLLOWING_MANAGE_SEARCH_RESULT,
					} }
					items={ showMoreResults ? searchResults : take( searchResults, 10 ) }
					width={ width }
					fetchNextPage={ this.fetchNextPage }
					hasNextPage={ showMoreResults ? this.hasNextPage : undefined }
					rowRenderer={ siteRowRenderer }
				/>
				{ ! showMoreResults && searchResultsCount > 10 && (
					<div className="following-manage__show-more">
						<Button
							compact
							onClick={ onShowMoreResultsClicked }
							className="following-manage__show-more-button button"
						>
							<Gridicon icon="chevron-down" />
							{ translate( 'Show more' ) }
						</Button>
					</div>
				) }
			</div>
		);
	}
}

export default connect( null, { requestFeedSearch } )(
	localize( FollowingManageSearchFeedsResults )
);
