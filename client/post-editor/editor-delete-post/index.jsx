/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import accept from 'lib/accept';
import utils from 'lib/posts/utils';
import Button from 'components/button';
import { getSite } from 'state/sites/selectors';

class EditorDeletePost extends React.Component {
	static displayName = 'EditorDeletePost';

	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		onTrashingPost: PropTypes.func,
	};

	state = {
		isTrashing: false,
	};

	sendToTrash = () => {
		if ( ! utils.userCan( 'delete_post', this.props.post ) ) {
			return;
		}

		this.setState( { isTrashing: true } );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.trash( this.props.site, this.props.post, error => {
			this.setState( { isTrashing: false } );

			if ( this.props.onTrashingPost ) {
				this.props.onTrashingPost( error );
			}
		} );
	};

	onSendToTrash = () => {
		let message;
		if ( this.state.isTrashing ) {
			return;
		}

		if ( this.props.post.type === 'page' ) {
			message = this.props.translate( 'Are you sure you want to trash this page?' );
		} else {
			message = this.props.translate( 'Are you sure you want to trash this post?' );
		}

		accept(
			message,
			accepted => {
				if ( accepted ) {
					this.sendToTrash();
				}
			},
			this.props.translate( 'Move to trash' ),
			this.props.translate( 'Back' )
		);
	};

	render() {
		const { post } = this.props;
		if ( ! post || ! post.ID || post.status === 'trash' ) {
			return null;
		}

		const classes = classnames( 'editor-delete-post__button', {
			'is-trashing': this.state.isTrashing,
		} );
		const label = this.state.isTrashing
			? this.props.translate( 'Trashing...' )
			: this.props.translate( 'Move to trash' );

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

export default connect( ( state, props ) => ( {
	site: getSite( state, get( props, 'post.site_ID' ) ),
} ) )( localize( EditorDeletePost ) );
