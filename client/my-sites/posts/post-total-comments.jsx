/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getPostTotalCommentsCount } from 'state/comments/selectors';

const PostTotalComments = React.createClass( {

	propTypes: {
		clickHandler: PropTypes.func,
		originalCount: PropTypes.number,
		commentsOpen: PropTypes.bool.isRequired,
		postId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired
	},

	render() {
		const {
			clickHandler,
			commentsOpen
		} = this.props;

		const commentCount = this.getCommentCount();

		let showComments = true,
			commentTitle,
			commentCountDisplay;

		if ( commentCount > 0 ) {
			commentTitle = this.translate( '%(count)s Comment', '%(count)s Comments', {
				count: commentCount,
				args: {
					count: commentCount
				}
			} );
			commentCountDisplay = this.numberFormat( commentCount );
		} else if ( commentsOpen ) {
			commentTitle = this.translate( 'Comments' );
		} else {
			// No comments recorded & they're disabled, don't show the icon
			showComments = false;
		}

		if ( ! showComments ) {
			return null;
		}

		return (
			<a
				title={ commentTitle }
				onClick={ clickHandler }
				className={
					classNames( {
						post__comments: true,
						'is-empty': ! commentCountDisplay
					} )
				}
			>
				<Gridicon icon="comment" size={ 24 } />
				<span>{ commentCountDisplay }</span>
			</a>
		);
	},

	getCommentCount: function( syncedCount = this.props.syncedCount, originalCount = this.props.originalCount ) {
		if ( syncedCount === undefined ) {
			return originalCount;
		}
		return syncedCount;
	}

} );

export default connect( ( state, ownProps ) => {
	const { siteId, postId } = ownProps,
		syncedCount = getPostTotalCommentsCount( state, siteId, postId );

	return {
		syncedCount
	};
} )( PostTotalComments );

// pure component used in tests
export { PostTotalComments as PurePostTotalComments };
