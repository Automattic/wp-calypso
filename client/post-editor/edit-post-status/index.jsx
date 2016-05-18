/**
 * External dependencies
 */
const React = require( 'react' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
const actions = require( 'lib/posts/actions' ),
	Button = require( 'components/button' ),
	FormToggle = require( 'components/forms/form-toggle/compact' ),
	Revisions = require( 'post-editor/editor-revisions' ),
	Gridicon = require( 'components/gridicon' ),
	postUtils = require( 'lib/posts/utils' ),
	Popover = require( 'components/popover' ),
	InfoPopover = require( 'components/info-popover' ),
	Tooltip = require( 'components/tooltip' ),
	PostSchedule = require( 'components/post-schedule' ),
	postScheduleUtils = require( 'components/post-schedule/utils' ),
	siteUtils = require( 'lib/site/utils' ),
	stats = require( 'lib/posts/stats' );

export default React.createClass( {
	displayName: 'EditPostStatus',

	propTypes: {
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		type: React.PropTypes.string,
		onSave: React.PropTypes.func,
		onDateChange: React.PropTypes.func,
		site: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			showTZTooltip: false,
			showPostSchedulePopover: false,
			onDateChange: noop
		};
	},

	toggleStickyStatus: function() {
		var stickyStat, stickyEventLabel;

		if ( ! this.props.post.sticky ) {
			stickyStat = 'advanced_sticky_enabled';
			stickyEventLabel = 'On';
		} else {
			stickyStat = 'advanced_sticky_disabled';
			stickyEventLabel = 'Off';
		}

		stats.recordStat( stickyStat );
		stats.recordEvent( 'Changed Sticky Setting', stickyEventLabel );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { sticky: ! this.props.post.sticky } );
	},

	togglePendingStatus: function() {
		var pending = this.props.post.status === 'pending';

		stats.recordStat( 'status_changed' );
		stats.recordEvent( 'Changed Pending Status', pending ? 'Marked Draft' : 'Marked Pending' );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { status: pending ? 'draft' : 'pending' } );
	},

	togglePostSchedulePopover: function() {
		this.setState( {
			showPostSchedulePopover: ! this.state.showPostSchedulePopover
		} );
	},

	revertToDraft: function() {
		this.props.onSave( 'draft' );
	},

	showTZTooltip: function() {
		this.setState( { showTZTooltip: true } );
	},

	hideTZTooltip: function() {
		this.setState( { showTZTooltip: false } );
	},

	render: function() {
		var isSticky, isPublished, isPending, canPublish, isScheduled;

		if ( this.props.post ) {
			isSticky = this.props.post.sticky;
			isPending = postUtils.isPending( this.props.post );
			isPublished = this.props.savedPost.status === 'publish';
			isScheduled = this.props.savedPost.status === 'future';
			canPublish = siteUtils.userCan( 'publish_posts', this.props.site );
		}

		const adminUrl = this.props.site &&
			this.props.site.options &&
			this.props.site.options.admin_url;

		const fullDate = postScheduleUtils.convertDateToUserLocation(
			( postUtils.getEditedTime( this.props.post ) || new Date() ),
			siteUtils.timezone( this.props.site ),
			siteUtils.gmtOffset( this.props.site )
		).format( 'll LT' );

		return (
			<div className="edit-post-status">
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
									{ this.translate( 'Future' ) }
								</span>
							: <Gridicon icon="time" size={ 18 } />
					}

					{ fullDate }
					{ this.renderTZTooltop() }
					{ this.renderPostSchedulePopover() }
				</span>
				<Revisions
						revisions={ this.props.post && this.props.post.revisions }
						adminUrl={ adminUrl } />
				{ this.props.type === 'post' &&
					<label className="edit-post-status__sticky">
						<span className="edit-post-status__label-text">
							{ this.translate( 'Stick to the front page' ) }
							<InfoPopover position="top right" gaEventCategory="Editor" popoverName="Sticky Post">
								{ this.translate( 'Sticky posts will appear at the top of the posts listing.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ isSticky }
							onChange={ this.toggleStickyStatus }
							aria-label={ this.translate( 'Stick post to the front page' ) }
						/>
					</label>
				}
				{ ( ! isPublished && ! isScheduled && canPublish ) &&
					<label className="edit-post-status__pending-review">
						<span className="edit-post-status__label-text">
							{ this.translate( 'Pending review' ) }
							<InfoPopover position="top right">
								{ this.translate( 'Flag this post to be reviewed for approval.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ isPending }
							onChange={ this.togglePendingStatus }
							aria-label={ this.translate( 'Request review for post' ) }
						/>
					</label>
				}
				{ ( isPublished || isScheduled || isPending && ! canPublish ) &&
					<Button
						className="edit-post-status__revert-to-draft"
						onClick={ this.revertToDraft }
						compact={ true }
					>
						<Gridicon icon="undo" size={ 18 } /> { this.translate( 'Revert to draft' ) }
					</Button>
				}
			</div>
		);
	},

	renderPostSchedulePopover: function() {
		var tz = siteUtils.timezone( this.props.site ),
			gmt = siteUtils.gmtOffset( this.props.site ),
			selectedDay = this.props.post && this.props.post.date
				? this.moment( this.props.post.date )
				: null;

		return (
			<Popover
				context={ this.refs && this.refs.postStatusTooltip }
				isVisible={ this.state.showPostSchedulePopover }
				position="right"
				onClose={ this.togglePostSchedulePopover }
			>
				<div className="edit-post-status__post-schedule">
					<PostSchedule
						selectedDay={ selectedDay }
						timezone={ tz }
						gmtOffset={ gmt }
						onDateChange={ this.props.onDateChange }>
					</PostSchedule>
				</div>
			</Popover>
		);
	},

	renderTZTooltop: function() {
		var timezone = siteUtils.timezone( this.props.site ),
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
				position="right"
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
} );
