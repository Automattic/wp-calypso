/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import EditorPublishDate from 'post-editor/editor-publish-date';
import EditorVisibility from 'post-editor/editor-visibility';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import EditorConfirmationSidebarHeader from './header';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import { isEditedPostPrivate, isPrivateEditedPostPasswordValid } from 'state/posts/selectors';

class EditorConfirmationSidebar extends React.Component {
	static propTypes = {
		handlePreferenceChange: PropTypes.func,
		onPrivatePublish: PropTypes.func,
		onPublish: PropTypes.func,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		isPrivatePost: PropTypes.bool,
		isPrivatePostPasswordValid: PropTypes.bool,
		setPostDate: PropTypes.func,
		setStatus: PropTypes.func,
		site: PropTypes.object,
		status: PropTypes.string,
	};

	getCloseOverlayHandler = ( context ) => () => this.props.setStatus( { status: 'closed', context } );

	closeAndPublish = () => {
		this.props.setStatus( { status: 'closed', context: 'publish' } );
		this.props.onPublish( true );
	};

	getPublishButtonLabel( publishButtonStatus ) {
		switch ( publishButtonStatus ) {
			case 'update':
				return this.props.translate( 'Update' );
			case 'schedule':
				return this.props.translate( 'Schedule!' );
			case 'publish':
				return this.props.translate( 'Publish!' );
			case 'requestReview':
				return this.props.translate( 'Submit for Review' );
		}
	}

	renderPublishButton() {
		if ( ! this.props.site || ! this.props.post || ! this.props.savedPost ) {
			return;
		}

		const publishButtonStatus = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost );
		const buttonLabel = this.getPublishButtonLabel( publishButtonStatus );
		const enabled = ! this.props.isPrivatePost || this.props.isPrivatePostPasswordValid;

		return (
			<Button disabled={ ! enabled } onClick={ this.closeAndPublish }>{ buttonLabel }</Button>
		);
	}

	getBusyButtonLabel( publishButtonStatus ) {
		switch ( publishButtonStatus ) {
			case 'update':
				return this.props.translate( 'Updating...' );
			case 'schedule':
				return this.props.translate( 'Scheduling...' );
			case 'publish':
				return this.props.translate( 'Publishing...' );
			case 'requestReview':
				return this.props.translate( 'Submitting for Review...' );
		}

		return this.props.translate( 'Publishing...' );
	}

	renderPrivacyControl() {
		if ( ! this.props.post ) {
			return;
		}

		const { password, type } = this.props.post || {};
		const status = get( this.props.post, 'status', 'draft' );
		const isPrivateSite = get( this.props, 'site.is_private' );
		const savedStatus = get( this.props, 'savedPost.status' );
		const savedPassword = get( this.props, 'savedPost.password' );
		const props = {
			onPrivatePublish: this.props.onPrivatePublish,
			isPrivateSite,
			type,
			password,
			status,
			savedStatus,
			savedPassword,
			context: 'confirmation-sidebar',
		};

		return (
			<EditorVisibility { ...props } />
		);
	}

	renderPublishingBusyButton() {
		if ( 'publishing' !== this.props.status ) {
			return;
		}

		if ( ! this.props.site || ! this.props.post || ! this.props.savedPost ) {
			return;
		}

		const publishButtonStatus = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost );
		const buttonLabel = this.getBusyButtonLabel( publishButtonStatus );

		return (
			<Button disabled className="editor-confirmation-sidebar__publishing-button is-busy is-primary">{ buttonLabel }</Button>
		);
	}

	renderNoticeDisplayPreferenceCheckbox() {
		return (
			<div className="editor-confirmation-sidebar__display-preference">
				<FormLabel>
					<FormCheckbox
						onChange={ this.props.handlePreferenceChange }
						defaultChecked
						className="editor-confirmation-sidebar__display-preference-checkbox"
						id="confirmation_sidebar_display_preference"
						name="confirmation_sidebar_display_preference" />
					<span>{ this.props.translate( 'Show this every time I publish', {
						comment: 'This string appears in the bottom of a publish confirmation sidebar.' +
							'There is limited space. Longer strings will wrap.'
					} ) }</span>
				</FormLabel>
			</div>
		);
	}

	render() {
		const isSidebarActive = this.props.status === 'open';
		const isOverlayActive = this.props.status !== 'closed';

		return (
			<div className={ classnames( {
				'editor-confirmation-sidebar': true,
				'is-active': isOverlayActive,
			} ) } >
				{ this.renderPublishingBusyButton() }

				<div className={ classnames( {
					'editor-confirmation-sidebar__sidebar': true,
					'is-active': isSidebarActive,
				} ) }>
					<div className="editor-confirmation-sidebar__ground-control">
						<div className="editor-confirmation-sidebar__close">
							<Button
								borderless
								onClick={ this.getCloseOverlayHandler( 'dismiss_x' ) }
								title={ this.props.translate( 'Close sidebar' ) }
								aria-label={ this.props.translate( 'Close sidebar' ) }>
								<Gridicon icon="cross" />
							</Button>
						</div>
						<div className="editor-confirmation-sidebar__action">
							{ this.renderPublishButton() }
						</div>
					</div>
					<div className="editor-confirmation-sidebar__content-wrap">
						<EditorConfirmationSidebarHeader post={ this.props.post } />
						<EditorPublishDate
							post={ this.props.post }
							setPostDate={ this.props.setPostDate }
						/>
						<div className="editor-confirmation-sidebar__privacy-control">
							{ this.renderPrivacyControl() }
						</div>
					</div>
					{ this.renderNoticeDisplayPreferenceCheckbox() }
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const isPrivatePost = isEditedPostPrivate( state, siteId, postId );
		const isPrivatePostPasswordValid = isPrivateEditedPostPasswordValid( state, siteId, postId );

		return {
			siteId,
			postId,
			post,
			isPrivatePost,
			isPrivatePostPasswordValid
		};
	},
	{ editPost }
)( localize( EditorConfirmationSidebar ) );
