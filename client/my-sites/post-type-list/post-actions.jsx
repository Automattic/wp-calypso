/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';
import { trashPost, deletePost } from 'state/posts/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

function PostTypeListPostActions( { translate, post, dispatchTrashPost, dispatchDeletePost } ) {
	function onTrash() {
		if ( ! post ) {
			return;
		}

		let dispatchAction;
		if ( 'trash' !== post.status ) {
			dispatchAction = dispatchTrashPost;
		} else if ( confirm( translate( 'Are you sure you want to permanently delete this post?' ) ) ) {
			dispatchAction = dispatchDeletePost;
		}

		if ( dispatchAction ) {
			dispatchAction( post.site_ID, post.ID );
		}
	}

	return (
		<div className="post-type-list__post-actions">
			<Button onClick={ onTrash } borderless>
				<Gridicon icon="trash" />
				<span className="post-type-list__post-actions-srt">
					{ post && 'trash' === post.status
						? translate( 'Delete Permanently' )
						: translate( 'Trash', { context: 'verb' } ) }
				</span>
			</Button>
			<Button href={ post ? post.URL : '' } target="_blank" borderless>
				<Gridicon icon="external" />
				<span className="post-type-list__post-actions-srt">
					{ translate( 'View', { context: 'verb' } ) }
				</span>
			</Button>
		</div>
	);
}

PostTypeListPostActions.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func,
	post: PropTypes.object,
	trashPost: PropTypes.func,
	deletePost: PropTypes.func
};

export default connect(
	( state, ownProps ) => {
		return {
			post: getPost( state, ownProps.globalId )
		};
	},
	{
		dispatchTrashPost: trashPost,
		dispatchDeletePost: deletePost
	}
)( localize( PostTypeListPostActions ) );
