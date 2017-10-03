/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import accept from 'lib/accept';
import utils from 'lib/posts/utils';
import Button from 'components/button';

class EditorDeletePost extends Component {

	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		onTrashingPost: PropTypes.func,
	};

	state = {
		isTrashing: false,
	};

	sendToTrash() {
		this.setState( { isTrashing: true } );

		if ( utils.userCan( 'delete_post', this.props.post ) ) {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.trash(
				this.props.post,
				( error ) => {
					if ( error ) {
						this.setState( { isTrashing: false } );
					}

					if ( this.props.onTrashingPost ) {
						this.props.onTrashingPost( error );
					}
				}
			);
		}
	}

	onSendToTrash = () => {
		const { translate } = this.props;
		if ( this.state.isTrashing ) {
			return;
		}

		const message = this.props.post.type === 'page'
			? translate( 'Are you sure you want to trash this page?' )
			: translate( 'Are you sure you want to trash this post?' );

		accept( message, ( accepted ) => {
			if ( accepted ) {
				this.sendToTrash();
			}
		}, translate( 'Move to trash' ), translate( 'Back' ) );
	}

	render() {
		const { post, translate } = this.props;
		if ( ! post || ! post.ID || post.status === 'trash' ) {
			return null;
		}

		const classes = classnames( 'editor-delete-post__button', { 'is-trashing': this.state.isTrashing } );
		const label = this.state.isTrashing
			? translate( 'Trashing…' )
			: translate( 'Move to trash' );

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

EditorDeletePost.displayName = 'EditorDeletePost';

export default localize( EditorDeletePost );
