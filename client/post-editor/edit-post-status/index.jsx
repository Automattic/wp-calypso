/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';
import { recordStat, recordEvent } from 'lib/posts/stats';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import EditorPublishDate from 'post-editor/editor-publish-date';
import Revisions from 'post-editor/editor-revisions';
import EditorVisibility from 'post-editor/editor-visibility';
import { editPost } from 'state/posts/actions';
import { getEditedPost } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class EditPostStatus extends Component {

	static propTypes = {
		moment: PropTypes.func,
		setPostDate: PropTypes.func,
		onSave: PropTypes.func,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func,
		type: PropTypes.string,
		postDate: PropTypes.string,
		onPrivatePublish: PropTypes.func,
		status: PropTypes.string,
		isPostPrivate: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		setNestedSidebar: PropTypes.func,
		selectRevision: PropTypes.func,
	};

	constructor( props ) {
		super( props );
	}

	toggleStickyStatus = () => {
		let stickyStat, stickyEventLabel;

		if ( ! this.props.post.sticky ) {
			stickyStat = 'advanced_sticky_enabled';
			stickyEventLabel = 'On';
		} else {
			stickyStat = 'advanced_sticky_disabled';
			stickyEventLabel = 'Off';
		}

		recordStat( stickyStat );
		recordEvent( 'Changed Sticky Setting', stickyEventLabel );

		this.props.editPost( this.props.siteId, this.props.postId, {
			sticky: ! this.props.post.sticky
		} );
	};

	togglePendingStatus = () => {
		const pending = this.props.post.status === 'pending';

		recordStat( 'status_changed' );
		recordEvent( 'Changed Pending Status', pending ? 'Marked Draft' : 'Marked Pending' );

		this.props.editPost( this.props.siteId, this.props.postId, {
			status: pending ? 'draft' : 'pending'
		} );
	};

	revertToDraft = () => {
		this.props.onSave( 'draft' );
	};

	render() {
		let isSticky, isPublished, isPending, canPublish, isScheduled, isPasswordProtected;
		const { translate, isPostPrivate } = this.props;

		if ( this.props.post ) {
			isPasswordProtected = postUtils.getVisibility( this.props.post ) === 'password';
			isSticky = this.props.post.sticky;
			isPending = postUtils.isPending( this.props.post );
			isPublished = postUtils.isPublished( this.props.savedPost );
			isScheduled = this.props.savedPost && this.props.savedPost.status === 'future';
			canPublish = siteUtils.userCan( 'publish_posts', this.props.site );
		}

		const adminUrl = this.props.site &&
			this.props.site.options &&
			this.props.site.options.admin_url;

		return (
			<div className="edit-post-status">
				{ this.renderPostScheduling() }
				{ this.renderPostVisibility() }
				{ this.props.type === 'post' && ! isPostPrivate && ! isPasswordProtected &&
					<label className="edit-post-status__sticky">
						<span className="edit-post-status__label-text">
							{ translate( 'Stick to the front page' ) }
							<InfoPopover position="top right" gaEventCategory="Editor" popoverName="Sticky Post">
								{ translate( 'Sticky posts will appear at the top of the posts listing.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ isSticky }
							onChange={ this.toggleStickyStatus }
							aria-label={ translate( 'Stick post to the front page' ) }
						/>
					</label>
				}
				{ ( ! isPublished && ! isScheduled && canPublish ) &&
					<label className="edit-post-status__pending-review">
						<span className="edit-post-status__label-text">
							{ translate( 'Pending review' ) }
							<InfoPopover position="top right">
								{ translate( 'Flag this post to be reviewed for approval.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ isPending }
							onChange={ this.togglePendingStatus }
							aria-label={ translate( 'Request review for post' ) }
						/>
					</label>
				}
				{ ( isPublished || isScheduled || isPending && ! canPublish ) &&
					<Button
						className="edit-post-status__revert-to-draft"
						onClick={ this.revertToDraft }
						compact={ true }
					>
						<Gridicon icon="undo" size={ 18 } /> { translate( 'Revert to draft' ) }
					</Button>
				}
				<Revisions
					revisions={ this.props.post && this.props.post.revisions }
					adminUrl={ adminUrl }
					setNestedSidebar={ this.props.setNestedSidebar }
					selectRevision={ this.props.selectRevision }
				/>
			</div>
		);
	}

	renderPostScheduling() {
		return (
			<EditorPublishDate
				post={ this.props.post }
				setPostDate={ this.props.setPostDate }
			/>
		);
	}

	renderPostVisibility() {
		if ( ! this.props.post ) {
			return;
		}

		// Do not render the editor visibility component on both the editor sidebar and the confirmation sidebar
		// at the same time so that it is predictable which one gets the focus / shows the validation error message.
		if ( 'open' === this.props.confirmationSidebarStatus ) {
			return;
		}

		const { password, type } = this.props.post || {};
		const isPrivateSite = this.props.site && this.props.site.is_private;
		const savedStatus = this.props.savedPost ? this.props.savedPost.status : null;
		const savedPassword = this.props.savedPost ? this.props.savedPost.password : null;
		const props = {
			status: this.props.status,
			onPrivatePublish: this.props.onPrivatePublish,
			isPrivateSite,
			type,
			password,
			savedStatus,
			savedPassword,
			context: 'post-settings',
		};

		return (
			<EditorVisibility { ...props } />
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
)( localize( EditPostStatus ) );
