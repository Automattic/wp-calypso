/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import HeaderBack from 'reader/header-back';
import { RelatedPostCard } from 'blocks/reader-related-card';
import { SEARCH_RESULTS } from 'reader/follow-sources';
import PostPlaceholder from 'reader/stream/post-placeholder';

class PostResults extends Component {
	static propTypes = {
		query: PropTypes.string,
		streamKey: PropTypes.string,
	};

	placeholderFactory = ( { key, ...rest } ) => {
		if ( ! this.props.query ) {
			return (
				<div className="search-stream__recommendation-list-item" key={ key }>
					<RelatedPostCard { ...rest } />
				</div>
			);
		}
		return <PostPlaceholder key={ key } />;
	};

	render() {
		const { query, translate } = this.props;
		const emptyContent = <EmptyContent query={ query } />;
		const transformStreamItems =
			! query || query === ''
				? ( postKey ) => ( { ...postKey, isRecommendation: true } )
				: identity;

		return (
			<Stream
				{ ...this.props }
				followSource={ SEARCH_RESULTS }
				listName={ translate( 'Search' ) }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				placeholderFactory={ this.placeholderFactory }
				shouldCombineCards={ true }
				transformStreamItems={ transformStreamItems }
				isMain={ false }
			>
				{ this.props.showBack && <HeaderBack /> }
				<div ref={ this.handleStreamMounted } />
			</Stream>
		);
	}
}

export default localize( PostResults );
