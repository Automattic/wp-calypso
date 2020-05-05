/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { get, isNull } from 'lodash';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import { Button } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { trashPost } from 'state/posts/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import canCurrentUser from 'state/selectors/can-current-user';

/**
 * Style dependencies
 */
import './style.scss';

class EditorDeletePost extends React.Component {
	static displayName = 'EditorDeletePost';

	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postType: PropTypes.string,
		postStatus: PropTypes.string,
		canDelete: PropTypes.bool,
		onTrashingPost: PropTypes.func,
	};

	state = {
		isTrashing: false,
	};

	sendToTrash = () => {
		const { siteId, postId, canDelete } = this.props;

		if ( ! canDelete ) {
			return;
		}

		if ( this.props.onTrashingPost ) {
			this.props.onTrashingPost();
		}

		this.setState( { isTrashing: true } );

		this.props.trashPost( siteId, postId );
	};

	onSendToTrash = () => {
		const { translate, postType } = this.props;

		if ( this.state.isTrashing ) {
			return;
		}

		let message;
		if ( postType === 'page' ) {
			message = translate( 'Are you sure you want to trash this page?' );
		} else {
			message = translate( 'Are you sure you want to trash this post?' );
		}

		accept(
			message,
			( accepted ) => {
				if ( accepted ) {
					this.sendToTrash();
				}
			},
			translate( 'Move to trash' ),
			translate( 'Back' )
		);
	};

	render() {
		const { canDelete, postId, postStatus, translate } = this.props;
		if ( ! canDelete || ! postId || postStatus === 'trash' ) {
			return null;
		}

		const classes = classnames( 'editor-delete-post__button', {
			'is-trashing': this.state.isTrashing,
		} );
		const label = this.state.isTrashing ? translate( 'Trashing…' ) : translate( 'Move to trash' );

		return (
			<div className="editor-delete-post">
				<Button
					borderless
					className={ classes }
					onClick={ this.onSendToTrash }
					aria-label={ label }
				>
					<Gridicon icon="trash" size={ 18 } />
					{ label }
				</Button>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );

		const userId = getCurrentUserId( state );
		const isAuthor = ! isNull( userId ) && get( post, [ 'author', 'ID' ], null ) === userId;

		return {
			siteId,
			postId,
			postType: get( post, 'type', null ),
			postStatus: get( post, 'status', null ),
			canDelete: canCurrentUser( state, siteId, isAuthor ? 'delete_posts' : 'delete_others_posts' ),
		};
	},
	{ trashPost }
)( localize( EditorDeletePost ) );
