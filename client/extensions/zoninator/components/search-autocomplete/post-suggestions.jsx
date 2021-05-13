/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, map } from 'lodash';

/**
 * Internal depencencies
 */
import QueryPosts from 'calypso/components/data/query-posts';
import { getPostsForQuery } from 'calypso/state/posts/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Suggestions } from '@automattic/components';

class PostSuggestions extends Component {
	static propTypes = {
		exclude: PropTypes.array,
		posts: PropTypes.array.isRequired,
		search: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		suggest: PropTypes.func.isRequired,
	};

	static defaultProps = {
		exclude: [],
		search: '',
	};

	suggestionsRef = React.createRef();

	handleKeyEvent = ( event ) => this.suggestionsRef.current.handleKeyEvent( event );

	suggest = ( { postId } ) => this.props.suggest( find( this.props.posts, { ID: postId } ) );

	render() {
		const { exclude, posts, search, siteId } = this.props;
		const suggestions = map( posts, ( post ) => ( { label: post.title, postId: post.ID } ) );

		return (
			<Fragment>
				<QueryPosts siteId={ siteId } query={ { search, exclude } } />
				<Suggestions
					ref={ this.suggestionsRef }
					query={ search }
					suggestions={ suggestions }
					suggest={ this.suggest }
				/>
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { exclude, search } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		posts: getPostsForQuery( state, siteId, { search, exclude } ) || [],
		siteId,
	};
};

const connectComponent = connect( mapStateToProps, null, null, { forwardRef: true } );

export default connectComponent( PostSuggestions );
