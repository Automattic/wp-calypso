/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import Button from 'components/button';
import EditorVisibility from 'post-editor/editor-visibility';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPublishButtonStatus } from 'post-editor/editor-publish-button';

class EditorConfirmationSidebar extends React.Component {
	static propTypes = {
		handlePreferenceChange: React.PropTypes.func,
		onPrivatePublish: React.PropTypes.func,
		onPublish: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		setStatus: React.PropTypes.func,
		site: React.PropTypes.object,
		status: React.PropTypes.string,
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
				return this.props.translate( 'Schedule' );
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

		return (
			<Button onClick={ this.closeAndPublish }>{ buttonLabel }</Button>
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

		const { password, type, status } = this.props.post || {};
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
			<RootChild>
				<div className={ classnames( {
					'editor-confirmation-sidebar': true,
					'is-active': isOverlayActive,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': isOverlayActive,
					} ) } onClick={ this.getCloseOverlayHandler( 'dismiss_overlay' ) }>
						{ this.renderPublishingBusyButton() }
					</div>
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
							<div className="editor-confirmation-sidebar__header">
								{
									this.props.translate( '{{strong}}Ready to go?{{/strong}} Double-check and then confirm to publish.', {
										comment: 'This string appears as the header for the confirmation sidebar ' +
											'when a user publishes a post or page.',
										components: {
											strong: <strong />
										},
									} )
								}
							</div>
							<div className="editor-confirmation-sidebar__privacy-control">
								{ this.renderPrivacyControl() }
							</div>
						</div>
						{ this.renderNoticeDisplayPreferenceCheckbox() }
					</div>
				</div>
			</RootChild>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );

		return {
			siteId,
			postId,
			post
		};
	},
	{ editPost }
)( localize( EditorConfirmationSidebar ) );
