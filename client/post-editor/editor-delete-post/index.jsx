/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import accept from 'lib/accept';
import utils from 'lib/posts/utils';
import Button from 'components/button';

export default React.createClass( {
	displayName: 'EditorDeletePost',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		onTrashingPost: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			isTrashing: false,
		};
	},

	sendToTrash() {
		this.setState( { isTrashing: true } );

		const handleTrashingPost = function( error ) {
			if ( error ) {
				this.setState( { isTrashing: false } );
			}

			if ( this.props.onTrashingPost ) {
				this.props.onTrashingPost( error );
			}
		}.bind( this );

		if ( utils.userCan( 'delete_post', this.props.post ) ) {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.trash( this.props.post, handleTrashingPost );
		}
	},

	onSendToTrash() {
		let message;
		if ( this.state.isTrashing ) {
			return;
		}

		if ( this.props.post.type === 'page' ) {
			message = this.translate( 'Are you sure you want to trash this page?' );
		} else {
			message = this.translate( 'Are you sure you want to trash this post?' );
		}

		accept( message, ( accepted ) => {
			if ( accepted ) {
				this.sendToTrash();
			}
		}, this.translate( 'Move to trash' ), this.translate( 'Back' ) );
	},

	render() {
		const { post } = this.props;
		if ( ! post || ! post.ID || post.status === 'trash' ) {
			return null;
		}

		const classes = classnames( 'editor-delete-post__button', { 'is-trashing': this.state.isTrashing } );
		const label = this.state.isTrashing ? this.translate( 'Trashing...' ) : this.translate( 'Move to trash' );

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
} );
