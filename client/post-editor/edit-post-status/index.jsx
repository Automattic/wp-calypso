/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import AsyncLoad from 'components/async-load';
import Button from 'components/button';
import FormToggle from 'components/forms/form-toggle/compact';
import Revisions from 'post-editor/editor-revisions';
import postUtils from 'lib/posts/utils';
import Popover from 'components/popover';
import InfoPopover from 'components/info-popover';
import Tooltip from 'components/tooltip';
import postScheduleUtils from 'components/post-schedule/utils';
import siteUtils from 'lib/site/utils';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import EditorPublishDate from 'post-editor/editor-publish-date';
import EditorVisibility from 'post-editor/editor-visibility';

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
	};

	constructor( props ) {
		super( props );
		this.state = {
			showTZTooltip: false,
			showPostSchedulePopover: false
		};
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

	togglePostSchedulePopover = () => {
		this.setState( {
			showPostSchedulePopover: ! this.state.showPostSchedulePopover
		} );
	};

	revertToDraft = () => {
		this.props.onSave( 'draft' );
	};

	showTZTooltip = () => {
		this.setState( { showTZTooltip: true } );
	};

	hideTZTooltip = () => {
		this.setState( { showTZTooltip: false } );
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

		const isPostPublishFlow = config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			abtest( 'postPublishConfirmation' ) === 'showPublishConfirmation';

		return (
			<div className="edit-post-status">
				{ this.renderPostScheduling() }
				{
					isPostPublishFlow
						? this.renderPostVisibility()
						: null
				}
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
				{
					! isPostPublishFlow
						? this.renderPostVisibility()
						: null
				}
				<Revisions
					revisions={ this.props.post && this.props.post.revisions }
					adminUrl={ adminUrl }
					setNestedSidebar={ this.props.setNestedSidebar }
				/>
			</div>
		);
	}

	renderPostScheduling() {
		const isPostPublishFlow = config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			abtest( 'postPublishConfirmation' ) === 'showPublishConfirmation';

		const fullDate = postScheduleUtils.convertDateToUserLocation(
			( this.props.postDate || new Date() ),
			siteUtils.timezone( this.props.site ),
			siteUtils.gmtOffset( this.props.site )
		).format( 'll LT' );

		if ( isPostPublishFlow ) {
			return (
				<EditorPublishDate
					post={ this.props.post }
					setPostDate={ this.props.setPostDate }
				/>
			);
		}

		return (
			<span
				ref="postStatusTooltip"
				className="edit-post-status__full-date"
				onMouseEnter={ this.showTZTooltip }
				onMouseLeave={ this.hideTZTooltip }
				onClick={ this.togglePostSchedulePopover }
			>
				{
					postUtils.isFutureDated( this.props.savedPost )
						? <span className="edit-post-status__future-label">
								{ this.props.translate( 'Future' ) }
							</span>
						: <Gridicon icon="time" size={ 18 } />
				}

				{ fullDate }
				{ this.renderTZTooltop() }
				{ this.renderPostSchedulePopover() }
			</span>
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

	renderPostSchedulePopover() {
		const tz = siteUtils.timezone( this.props.site ),
			gmt = siteUtils.gmtOffset( this.props.site ),
			selectedDay = this.props.postDate
				? this.props.moment( this.props.postDate )
				: null;

		return (
			<Popover
				context={ this.refs && this.refs.postStatusTooltip }
				isVisible={ this.state.showPostSchedulePopover }
				position="bottom left"
				onClose={ this.togglePostSchedulePopover }
			>
				<div className="edit-post-status__post-schedule">
					<AsyncLoad
						require="components/post-schedule"
						selectedDay={ selectedDay }
						timezone={ tz }
						gmtOffset={ gmt }
						onDateChange={ this.props.setPostDate }
					/>
				</div>
			</Popover>
		);
	}

	renderTZTooltop() {
		const timezone = siteUtils.timezone( this.props.site ),
			gmtOffset = siteUtils.gmtOffset( this.props.site );

		if ( ! ( timezone || postScheduleUtils.isValidGMTOffset( gmtOffset ) ) ) {
			return;
		}

		if ( this.state.showPostSchedulePopover ) {
			return;
		}

		return (
			<Tooltip
				context={ this.refs && this.refs.postStatusTooltip }
				isVisible={ this.state.showTZTooltip }
				position="left"
				onClose={ noop }
			>
				<div className="edit-post-status__full-date__tooltip">
					{ timezone ? timezone + ' ' : 'UTC' }
					{
						postScheduleUtils.getLocalizedDate(
							postUtils.getEditedTime( this.props.post ),
							timezone,
							gmtOffset
						).format( 'Z' )
					}
				</div>
			</Tooltip>
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
