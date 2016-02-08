/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import accept from 'lib/accept';
import utils from 'lib/posts/utils';
import Gridicon from 'components/gridicon';
import Tooltip from 'components/tooltip';
import { trashPost } from 'state/ui/editor/post/actions';

const EditorDeletePost = React.createClass( {
	displayName: 'EditorDeletePost',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		onTrashingPost: React.PropTypes.func,
		trashPost: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			trashPost: () => {}
		};
	},

	getInitialState: function() {
		return {
			isTrashing: false,
			tooltip: false
		};
	},

	sendToTrash() {
		this.setState( { isTrashing: true } );

		const handleTrashingPost = function( error ) {
			if ( error ) {
				return this.setState( { isTrashing: false } );
			}

			this.props.onTrashingPost();
		}.bind( this );

		if ( utils.userCan( 'delete_post', this.props.post ) ) {
			this.props.trashPost( this.props.post, handleTrashingPost );
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.trash( this.props.post, handleTrashingPost );
		}
	},

	onSendToTrash() {
		let message;

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

		const classes = classnames( 'editor-delete-post', { 'is-trashing': this.state.isTrashing } );
		let tooltipText = this.translate( 'Send post to the trash' );

		if ( post.type === 'page' ) {
			tooltipText = this.translate( 'Send page to the trash' );
		}

		return (
			<button
				className={ classes }
				onClick={ ! this.state.isTrashing && this.onSendToTrash }
				onMouseEnter={ () => this.setState( { tooltip: true } ) }
				onMouseLeave={ () => this.setState( { tooltip: false } ) }
				aria-label={ tooltipText }
				ref="deletePostTooltip"
			>
				<Gridicon icon="trash" />
				<Tooltip
					context={ this.refs && this.refs.deletePostTooltip }
					isVisible={ this.state.tooltip }
					position="bottom left"
				>
					{ tooltipText }
				</Tooltip>
			</button>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { trashPost }, dispatch )
)( EditorDeletePost );
