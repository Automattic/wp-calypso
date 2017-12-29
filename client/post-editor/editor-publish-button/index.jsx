/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordEvent } from 'lib/posts/stats';
import { isBackDatedPublished, isFutureDated, isPage, isPublished } from 'lib/posts/utils';
import Button from 'components/button';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { isEditedPostPrivate, isPrivateEditedPostPasswordValid } from 'state/posts/selectors';
import { canCurrentUser } from 'state/selectors';

export const getPublishButtonStatus = ( post, savedPost, canUserPublishPosts ) => {
	if (
		( isPublished( savedPost ) &&
			! isBackDatedPublished( savedPost ) &&
			! isFutureDated( post ) ) ||
		( savedPost && savedPost.status === 'future' && isFutureDated( post ) )
	) {
		return 'update';
	}

	if ( isFutureDated( post ) ) {
		return 'schedule';
	}

	if ( canUserPublishPosts ) {
		return 'publish';
	}

	if ( savedPost && savedPost.status === 'pending' ) {
		return 'update';
	}

	return 'requestReview';
};

export class EditorPublishButton extends Component {
	static propTypes = {
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		needsVerification: PropTypes.bool,
		privatePost: PropTypes.bool,
		privatePostPasswordValid: PropTypes.bool,
		busy: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
	};

	constructor( props ) {
		super( props );

		// bound methods
		this.onClick = this.onClick.bind( this );
	}

	trackClick() {
		const postEvents = {
			update: 'Clicked Update Post Button',
			schedule: 'Clicked Schedule Post Button',
			requestReview: 'Clicked Request-Review Post Button',
			publish: 'Clicked Publish Post Button',
		};
		const pageEvents = {
			update: 'Clicked Update Page Button',
			schedule: 'Clicked Schedule Page Button',
			requestReview: 'Clicked Request-Review Page Button',
			publish: 'Clicked Publish Page Button',
		};
		const buttonState = getPublishButtonStatus(
			this.props.post,
			this.props.savedPost,
			this.props.canUserPublishPosts
		);
		const eventString = isPage( this.props.post )
			? pageEvents[ buttonState ]
			: postEvents[ buttonState ];
		recordEvent( eventString );
		recordEvent( 'Clicked Primary Button' );
	}

	getButtonLabel() {
		switch ( getPublishButtonStatus(
			this.props.post,
			this.props.savedPost,
			this.props.canUserPublishPosts
		) ) {
			case 'update':
				return this.props.translate( 'Update' );
			case 'schedule':
				if ( this.props.isConfirmationSidebarEnabled ) {
					return this.props.translate( 'Schedule…', {
						comment: 'Button label on the editor sidebar - a confirmation step will follow',
					} );
				}

				return this.props.translate( 'Schedule' );
			case 'publish':
				if ( ! this.props.isConfirmationSidebarEnabled ) {
					return this.props.translate( 'Publish' );
				}

				if ( this.props.isPublishing ) {
					return this.props.translate( 'Publishing…', {
						comment: 'Button label on the editor sidebar while publishing is in progress',
					} );
				}

				return this.props.translate( 'Publish…', {
					comment: 'Button label on the editor sidebar - a confirmation step will follow',
				} );
			case 'requestReview':
				return this.props.translate( 'Submit for Review' );
		}
	}

	onClick() {
		this.trackClick();

		if ( isPublished( this.props.savedPost ) && ! isBackDatedPublished( this.props.savedPost ) ) {
			return this.props.onSave();
		}

		if ( this.props.canUserPublishPosts ) {
			return this.props.onPublish();
		}

		return this.props.onSave( 'pending' );
	}

	isEnabled() {
		return (
			! this.props.isPublishing &&
			! this.props.isSaveBlocked &&
			this.props.hasContent &&
			! this.props.needsVerification &&
			( ! this.props.privatePost || this.props.privatePostPasswordValid )
		);
	}

	render() {
		return (
			<Button
				className="editor-publish-button"
				primary
				busy={ this.props.busy }
				onClick={ this.onClick }
				disabled={ ! this.isEnabled() }
				tabIndex={ this.props.tabIndex }
				data-tip-target="editor-publish-button"
			>
				{ this.getButtonLabel() }
			</Button>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const privatePost = isEditedPostPrivate( state, siteId, postId );
	const privatePostPasswordValid = isPrivateEditedPostPasswordValid( state, siteId, postId );
	const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );

	return {
		privatePost,
		privatePostPasswordValid,
		canUserPublishPosts,
	};
} )( localize( EditorPublishButton ) );
