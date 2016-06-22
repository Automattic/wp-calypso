/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPostId, getPostSiteId, getPostUrl, getPostStatus } from 'state/posts/selectors';
import { trashPost, deletePost } from 'state/posts/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

function PostTypeListPostActions( props ) {
	function onTrash() {
		let dispatchAction;
		if ( 'trash' !== props.postStatus ) {
			dispatchAction = props.trashPost;
		} else if ( confirm( props.translate( 'Are you sure you want to permanently delete this post?' ) ) ) {
			dispatchAction = props.deletePost;
		}

		if ( dispatchAction ) {
			dispatchAction( props.postSiteId, props.postId );
		}
	}

	return (
		<div className="post-type-list__post-actions">
			<Button onClick={ onTrash } borderless>
				<Gridicon icon="trash" />
				<span className="screen-reader-text">
					{ 'trash' === props.postStatus
						? props.translate( 'Delete Permanently' )
						: props.translate( 'Trash', { context: 'verb' } ) }
				</span>
			</Button>
			<Button href={ props.postUrl } target="_blank" borderless>
				<Gridicon icon="external" />
				<span className="screen-reader-text">
					{ props.translate( 'View', { context: 'verb' } ) }
				</span>
			</Button>
		</div>
	);
}

PostTypeListPostActions.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func,
	trash: PropTypes.func,
	postUrl: PropTypes.string,
	postStatus: PropTypes.string
};

export default connect(
	( state, ownProps ) => {
		return {
			postId: getPostId( state, ownProps.globalId ),
			postSiteId: getPostSiteId( state, ownProps.globalId ),
			postUrl: getPostUrl( state, ownProps.globalId ),
			postStatus: getPostStatus( state, ownProps.globalId )
		};
	},
	{ trashPost, deletePost }
)( localize( PostTypeListPostActions ) );
