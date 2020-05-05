/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import EditorPublishDate from 'post-editor/editor-publish-date';
import EditorVisibility from 'post-editor/editor-visibility';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import EditorConfirmationSidebarHeader from './header';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorPublishButtonStatus } from 'state/ui/editor/selectors';
import {
	isEditedPostPasswordProtected,
	isEditedPostPasswordProtectedWithValidPassword,
	getEditedPost,
} from 'state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class EditorConfirmationSidebar extends Component {
	static propTypes = {
		handlePreferenceChange: PropTypes.func,
		onPrivatePublish: PropTypes.func,
		onPublish: PropTypes.func,
		post: PropTypes.object,
		isPasswordProtectedWithInvalidPassword: PropTypes.bool,
		setPostDate: PropTypes.func,
		setStatus: PropTypes.func,
		status: PropTypes.string,
	};

	state = {
		doFullRender: false,
	};

	static getDerivedStateFromProps( props, state ) {
		// In order to improve performance, `doFullRender` determines whether the
		// sidebar should be rendered or not. The content has to be rendered
		// the first time the sidebar is not in a 'closed' status.
		if ( ! state.doFullRender && props.status !== 'closed' ) {
			return { doFullRender: true };
		}
		return null;
	}

	getCloseOverlayHandler = ( context ) => () =>
		this.props.setStatus( { status: 'closed', context } );

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
		if ( this.props.publishButtonStatus === null ) {
			return null;
		}

		const buttonLabel = this.getPublishButtonLabel( this.props.publishButtonStatus );
		const disabled = this.props.isPasswordProtectedWithInvalidPassword;

		return (
			<Button primary disabled={ disabled } onClick={ this.closeAndPublish }>
				{ buttonLabel }
			</Button>
		);
	}

	getBusyButtonLabel( publishButtonStatus ) {
		switch ( publishButtonStatus ) {
			case 'update':
				return this.props.translate( 'Updating…' );
			case 'schedule':
				return this.props.translate( 'Scheduling…' );
			case 'publish':
				return this.props.translate( 'Publishing…' );
			case 'requestReview':
				return this.props.translate( 'Submitting for Review…' );
		}

		return this.props.translate( 'Publishing…' );
	}

	renderPrivacyControl() {
		return (
			<EditorVisibility
				onPrivatePublish={ this.props.onPrivatePublish }
				context="confirmation-sidebar"
			/>
		);
	}

	renderPublishingBusyButton() {
		if ( 'publishing' !== this.props.status || this.props.publishButtonStatus === null ) {
			return null;
		}

		const buttonLabel = this.getBusyButtonLabel( this.props.publishButtonStatus );

		return (
			<Button disabled primary busy className="editor-confirmation-sidebar__publishing-button">
				{ buttonLabel }
			</Button>
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
						name="confirmation_sidebar_display_preference"
					/>
					<span>
						{ this.props.translate( 'Show this every time I publish', {
							comment:
								'This string appears in the bottom of a publish confirmation sidebar. ' +
								'There is limited space. Longer strings will wrap.',
						} ) }
					</span>
				</FormLabel>
			</div>
		);
	}

	render() {
		const isSidebarActive = this.props.status === 'open';
		const isOverlayActive = this.props.status !== 'closed';

		if ( ! this.state.doFullRender ) {
			return (
				<div className="editor-confirmation-sidebar">
					<div key="sidebar" className="editor-confirmation-sidebar__sidebar" />
				</div>
			);
		}

		return (
			<div
				className={ classnames( 'editor-confirmation-sidebar', {
					'is-active': isOverlayActive,
				} ) }
			>
				{ this.renderPublishingBusyButton() }

				<div
					key="sidebar"
					className={ classnames( 'editor-confirmation-sidebar__sidebar', {
						'is-active': isSidebarActive,
					} ) }
				>
					<div className="editor-confirmation-sidebar__ground-control">
						<div className="editor-confirmation-sidebar__close">
							<Button
								borderless
								onClick={ this.getCloseOverlayHandler( 'dismiss_x' ) }
								title={ this.props.translate( 'Close sidebar' ) }
								aria-label={ this.props.translate( 'Close sidebar' ) }
							>
								<Gridicon icon="cross" />
							</Button>
						</div>
						<div className="editor-confirmation-sidebar__action">
							{ this.renderPublishButton() }
						</div>
					</div>
					<div className="editor-confirmation-sidebar__content-wrap">
						<EditorConfirmationSidebarHeader post={ this.props.post } />
						<EditorPublishDate post={ this.props.post } setPostDate={ this.props.setPostDate } />
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
		const isPasswordProtectedWithInvalidPassword =
			isEditedPostPasswordProtected( state, siteId, postId ) &&
			! isEditedPostPasswordProtectedWithValidPassword( state, siteId, postId );
		const publishButtonStatus = getEditorPublishButtonStatus( state );

		return {
			siteId,
			postId,
			post,
			isPasswordProtectedWithInvalidPassword,
			publishButtonStatus,
		};
	},
	{ editPost }
)( localize( EditorConfirmationSidebar ) );
