/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getSiteComment } from 'state/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CommentPostLink extends PureComponent {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
	};

	handleClick = event => {
		if ( ! window ) {
			return;
		}
		event.preventDefault();
		window.scrollTo( 0, 0 );

		const { commentId, postId, siteSlug, status } = this.props;
		const path = get( window, 'history.state.path' );

		const newPath =
			-1 !== path.indexOf( '#' )
				? path.replace( /[#].*/, `#comment-${ commentId }` )
				: `${ path }#comment-${ commentId }`;

		window.history.replaceState( { ...window.history.state, path: newPath }, null );

		page( `/comments/${ status }/${ siteSlug }/${ postId }` );
	};

	render() {
		const {
			isBulkMode,
			isPostTitleLoaded,
			postId,
			postTitle,
			siteId,
			siteSlug,
			status,
			translate,
		} = this.props;
		return (
			<div className="comment__post-link">
				{ ! isPostTitleLoaded && <QueryPosts siteId={ siteId } postId={ postId } /> }

				<Gridicon icon={ isBulkMode ? 'chevron-right' : 'posts' } size={ 18 } />

				<a
					href={ `/comments/${ status }/${ siteSlug }/${ postId }` }
					onClick={ this.handleClick }
					tabIndex={ isBulkMode ? -1 : 0 }
				>
					{ postTitle.trim() || translate( 'Untitled' ) }
				</a>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );

	const postId = get( comment, 'post.ID' );
	const post = getSitePost( state, siteId, postId );
	const postTitle =
		decodeEntities( get( comment, 'post.title' ) ) ||
		decodeEntities( stripHTML( get( post, 'excerpt' ) ) );

	return {
		isPostTitleLoaded: !! postTitle || !! post,
		postId,
		postTitle,
		siteSlug,
		siteId,
		status: 'unapproved' === commentStatus ? 'pending' : commentStatus,
	};
};

export default connect( mapStateToProps )( localize( CommentPostLink ) );
