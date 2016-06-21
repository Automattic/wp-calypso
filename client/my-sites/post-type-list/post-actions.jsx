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
import { trashPost } from 'state/posts/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

function PostTypeListPostActions( { translate, trash, post } ) {
	const onTrash = () => trash( post.site_ID, post.ID );

	return (
		<div className="post-type-list__post-actions">
			{ post && [
				<Button key="trash" onClick={ onTrash } borderless>
					<Gridicon icon="trash" />
					<span className="screen-reader-text">
						{ translate( 'Trash', { context: 'verb' } ) }
					</span>
				</Button>,
				<Button key="view" href={ post.URL } target="_blank" borderless>
					<Gridicon icon="external" />
					<span className="screen-reader-text">
						{ translate( 'View', { context: 'verb' } ) }
					</span>
				</Button>
			] }
		</div>
	);
}

PostTypeListPostActions.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func,
	trash: PropTypes.func,
	post: PropTypes.object
};

export default connect(
	( state, ownProps ) => {
		return {
			post: getPost( state, ownProps.globalId )
		};
	},
	{
		trash: trashPost
	}
)( localize( PostTypeListPostActions ) );
