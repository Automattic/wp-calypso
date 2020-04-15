/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { recordEditorEvent } from 'state/posts/stats';
import * as postUtils from 'state/posts/utils';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorPublishButtonStatus } from 'state/ui/editor/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import {
	getSitePost,
	isEditedPostPasswordProtected,
	isEditedPostPasswordProtectedWithValidPassword,
} from 'state/posts/selectors';

const POST_EVENTS = {
	update: 'Clicked Update Post Button',
	schedule: 'Clicked Schedule Post Button',
	requestReview: 'Clicked Request-Review Post Button',
	publish: 'Clicked Publish Post Button',
};

const PAGE_EVENTS = {
	update: 'Clicked Update Page Button',
	schedule: 'Clicked Schedule Page Button',
	requestReview: 'Clicked Request-Review Page Button',
	publish: 'Clicked Publish Page Button',
};

export class EditorPublishButton extends Component {
	static propTypes = {
		currentPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isSaving: PropTypes.bool,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		needsVerification: PropTypes.bool,
		isPasswordProtectedWithInvalidPassword: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
		recordEditorEvent: PropTypes.func.isRequired,
	};

	static defaultProps = {
		recordEditorEvent: noop,
	};

	trackClick() {
		const events = postUtils.isPage( this.props.currentPost ) ? PAGE_EVENTS : POST_EVENTS;
		this.props.recordEditorEvent( events[ this.props.publishButtonStatus ] );
		this.props.recordEditorEvent( 'Clicked Primary Button' );
	}

	getButtonLabel() {
		const { translate } = this.props;

		switch ( this.props.publishButtonStatus ) {
			case 'update':
				return translate( 'Update' );
			case 'schedule':
				if ( this.props.isConfirmationSidebarEnabled ) {
					return translate( 'Schedule…', {
						comment: 'Button label on the editor sidebar - a confirmation step will follow',
					} );
				}

				return translate( 'Schedule' );
			case 'publish':
				if ( ! this.props.isConfirmationSidebarEnabled ) {
					return translate( 'Publish' );
				}

				if ( this.props.isPublishing ) {
					return translate( 'Publishing…', {
						comment: 'Button label on the editor sidebar while publishing is in progress',
					} );
				}

				return translate( 'Publish…', {
					comment: 'Button label on the editor sidebar - a confirmation step will follow',
				} );
			case 'requestReview':
				return translate( 'Submit for Review' );
			default:
				return translate( 'Loading…' );
		}
	}

	onClick = () => {
		this.trackClick();

		if (
			postUtils.isPublished( this.props.currentPost ) &&
			! postUtils.isBackDatedPublished( this.props.currentPost )
		) {
			return this.props.onSave();
		}

		if ( this.props.canUserPublishPosts ) {
			return this.props.onPublish();
		}

		return this.props.onSave( 'pending' );
	};

	isBusy() {
		return (
			this.props.isPublishing ||
			( postUtils.isPublished( this.props.currentPost ) && this.props.isSaving )
		);
	}

	isEnabled() {
		return (
			! this.props.isPublishing &&
			! this.props.isSaveBlocked &&
			this.props.hasContent &&
			! this.props.needsVerification &&
			! this.props.isPasswordProtectedWithInvalidPassword
		);
	}

	render() {
		return (
			<Button
				className="editor-publish-button"
				primary
				busy={ this.isBusy() }
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

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const currentPost = getSitePost( state, siteId, postId );
		const publishButtonStatus = getEditorPublishButtonStatus( state );
		const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );
		const isPasswordProtectedWithInvalidPassword =
			isEditedPostPasswordProtected( state, siteId, postId ) &&
			! isEditedPostPasswordProtectedWithValidPassword( state, siteId, postId );

		return {
			currentPost,
			publishButtonStatus,
			canUserPublishPosts,
			isPasswordProtectedWithInvalidPassword,
		};
	},
	{ recordEditorEvent }
)( localize( EditorPublishButton ) );
