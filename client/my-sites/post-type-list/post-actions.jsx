/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPost } from 'state/posts/selectors';
import { deletePost } from 'state/posts/actions';
import { incrementPostCount } from 'state/posts/counts/actions';
import localize from 'lib/mixins/i18n/localize';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

function PostTypeListPostActions( { translate, trash, incrementCount, siteId, userId, post } ) {
	function trashAndTransitionStatus() {
		trash( siteId, post.ID, true );

		const isMine = post.author.ID === userId;
		incrementCount( siteId, post.type, post.status, isMine, -1 );
		if ( includes( [ 'post', 'page' ], post.type ) && 'trash' !== post.status ) {
			incrementCount( siteId, post.type, 'trash', isMine, 1 );
		}
	}

	let actions;
	if ( post ) {
		actions = [
			<Button key="trash" onClick={ trashAndTransitionStatus } borderless>
				<Gridicon icon="trash" />
				<span className="screen-reader-text">
					{ translate( 'Trash' ) }
				</span>
			</Button>,
			<Button key="view" href={ post.URL } target="_blank" borderless>
				<Gridicon icon="external" />
				<span className="screen-reader-text">
					{ translate( 'View' ) }
				</span>
			</Button>
		];
	}

	return (
		<div className="post-type-list__post-actions">
			{ actions }
		</div>
	);
}

PostTypeListPostActions.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func,
	trash: PropTypes.func,
	transitionStatusCount: PropTypes.func,
	siteId: PropTypes.number,
	userId: PropTypes.number,
	post: PropTypes.object
};

export default connect(
	( state, ownProps ) => {
		return {
			siteId: getSelectedSiteId( state ),
			userId: getCurrentUserId( state ),
			post: getPost( state, ownProps.globalId )
		};
	},
	{
		trash: deletePost,
		incrementCount: incrementPostCount
	}
)( localize( PostTypeListPostActions ) );
