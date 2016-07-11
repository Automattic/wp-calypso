/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { savePost } from 'state/posts/actions';
import { getPost } from 'state/posts/selectors';
import { isValidCapability, canCurrentUser } from 'state/current-user/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import AuthorSelector from 'components/author-selector';
import Gravatar from 'components/gravatar';

class PostTypePostAuthor extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canAssignUser: PropTypes.bool,
		author: PropTypes.object,
		isKnownType: PropTypes.bool
	}

	constructor() {
		super( ...arguments );

		this.setAuthor = this.setAuthor.bind( this );
	}

	setAuthor( author ) {
		const { siteId, postId } = this.props;
		if ( siteId && postId && author ) {
			this.props.savePost( {
				author: author.ID
			}, siteId, postId );
		}
	}

	render() {
		const { translate, author, siteId, canAssignUser, isKnownType } = this.props;

		let selector;
		if ( author ) {
			selector = (
				<span className="post-type-post-author__name">
					<Gravatar
						size={ 18 }
						user={ author }
						className="post-type-post-author__gravatar" />
					{ translate( 'by %(name)s', { args: { name: author.name } } ) }
				</span>
			);
		}

		if ( canAssignUser ) {
			selector = (
				<AuthorSelector
					siteId={ siteId }
					onSelect={ this.setAuthor }
					popoverPosition="bottom">
					{ selector }
				</AuthorSelector>
			);
		}

		return (
			<div className="post-type-post-author">
				{ ! isKnownType && siteId && (
					<QueryPostTypes siteId={ siteId } />
				) }
				{ selector }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const post = getPost( state, ownProps.globalId );
		if ( ! post ) {
			return {};
		}

		const type = getPostType( state, post.site_ID, post.type );

		let capability = 'edit_others_posts';
		const typeCapability = get( type, [ 'capabilities', capability ] );
		if ( isValidCapability( state, post.site_ID, typeCapability ) ) {
			capability = typeCapability;
		}

		return {
			author: post.author,
			siteId: post.site_ID,
			postId: post.ID,
			canAssignUser: canCurrentUser( state, post.site_ID, capability ),
			isKnownType: !! type
		};
	},
	{ savePost }
)( localize( PostTypePostAuthor ) );
