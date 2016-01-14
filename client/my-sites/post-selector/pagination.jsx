/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery,
	isSitePostsLastPageForQuery
} from 'state/posts/selectors';
import QueryPosts from 'components/data/query-posts';
import Selector from './selector';

function PostSelectorPagination( props ) {
	return (
		<div>
			<QueryPosts
				siteId={ props.siteId }
				query={ props.query }
			/>
			<Selector
				posts={ props.posts }
				page={ props.query.page }
				lastPage={ props.lastPage }
				loading={ props.loading }
				emptyMessage={ props.emptyMessage }
				createLink={ props.createLink }
				selected={ props.selected }
				onSearch={ props.onSearch }
				onChange={ props.onChange }
				onNextPage={ props.onNextPage }
				multiple={ props.multiple }
			/>
		</div>
	);
}

PostSelectorPagination.propTypes = {
	siteId: PropTypes.number.isRequired,
	query: PropTypes.object,
	posts: PropTypes.array,
	page: PropTypes.number,
	lastPage: PropTypes.bool,
	loading: PropTypes.bool,
	emptyMessage: PropTypes.string,
	createLink: PropTypes.string,
	onSearch: PropTypes.func,
	onChange: PropTypes.func,
	onNextPage: PropTypes.func,
	selected: PropTypes.number,
	multiple: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const { siteId, query } = ownProps;
	return {
		posts: getSitePostsForQueryIgnoringPage( state, siteId, query ),
		lastPage: isSitePostsLastPageForQuery( state, siteId, query ),
		loading: isRequestingSitePostsForQuery( state, siteId, query )
	};
} )( PostSelectorPagination );
