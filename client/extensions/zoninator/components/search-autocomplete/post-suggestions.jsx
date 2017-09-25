/**
 * External dependencies
 */
import { find, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import Suggestions from 'components/suggestions';
import { getSitePostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class PostSuggestions extends PureComponent {

	static propTypes = {
		exclude: PropTypes.array,
		posts: PropTypes.array.isRequired,
		search: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		suggest: PropTypes.func.isRequired,
	}

	static defaultProps = {
		exclude: [],
		search: '',
	}

	setSuggestions = ref => this.suggestionsRef = ref;

	handleKeyEvent = event => this.suggestionsRef.handleKeyEvent( event );

	suggest = ( { postId } ) => this.props.suggest( find( this.props.posts, { ID: postId } ) );

	render() {
		const { exclude, posts, search, siteId } = this.props;
		const suggestions = map( posts, post => ( { label: post.title, postId: post.ID } ) );

		return (
			<div>
				<QueryPosts siteId={ siteId } query={ { search, exclude } } />

				<Suggestions
					ref={ this.setSuggestions }
					query={ search }
					suggestions={ suggestions }
					suggest={ this.suggest } />
			</div>
		);
	}
}

const mapStateToProps = ( state, { exclude, search } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		posts: getSitePostsForQuery( state, siteId, { search, exclude } ) || [],
		siteId,
	};
};

const connectComponent = connect( mapStateToProps, null, null, { withRef: true } );

export default connectComponent( PostSuggestions );
