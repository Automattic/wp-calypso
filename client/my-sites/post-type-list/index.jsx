/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import PostTypeListList from './list';

/**
 * Constants
 */
const POSTS_PER_PAGE = 10;

class PostTypeList extends Component {
	constructor() {
		super( ...arguments );

		this.boundSetNextPage = this.setNextPage.bind( this );

		this.state = PostTypeList.initialState;
	}

	getQuery() {
		return Object.assign( {}, this.props.query, {
			page: this.state.page,
			number: POSTS_PER_PAGE
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( nextProps.query, this.props.query ) ) {
			this.setState( PostTypeList.initialState );
		}
	}

	setNextPage() {
		this.setState( {
			page: this.state.page + 1
		} );
	}

	render() {
		const query = this.getQuery();

		return (
			<div className="post-type-list">
				<QueryPosts
					siteId={ this.props.siteId }
					query={ query } />
				<PostTypeListList
					query={ query }
					requestNextPage={ this.boundSetNextPage } />
			</div>
		);
	}
}

PostTypeList.initialState = {
	page: 1
};

PostTypeList.propTypes = {
	query: PropTypes.object,
	siteId: PropTypes.number
};

export default connect( ( state ) => {
	return {
		siteId: getSelectedSiteId( state )
	};
} )( PostTypeList );
