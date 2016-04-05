/**
 * External dependencies
 */
const noop = require( 'lodash/noop' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	EditPostStatus = require( 'post-editor/edit-post-status' ),
	Gridicon = require( 'components/gridicon' ),
	Popover = require( 'components/popover' ),
	Site = require( 'my-sites/site' ),
	StatusLabel = require( 'post-editor/editor-status-label' ),
	postUtils = require( 'lib/posts/utils' ),
	siteUtils = require( 'lib/site/utils' ),
	PostSchedule = require( 'components/post-schedule' ),
	postActions = require( 'lib/posts/actions' ),
	Tooltip = require( 'components/tooltip' ),
	PostListFetcher = require( 'components/post-list-fetcher' ),
	stats = require( 'lib/posts/stats' );
import EditorPublishButton from 'post-editor/editor-publish-button';

export default React.createClass( {
	displayName: 'EditorGroundControl',

	propTypes: {
		hasContent: React.PropTypes.bool,
		isDirty: React.PropTypes.bool,
		isSaveBlocked: React.PropTypes.bool,
		isPublishing: React.PropTypes.bool,
		isSaving: React.PropTypes.bool,
		onPreview: React.PropTypes.func,
		onPublish: React.PropTypes.func,
		onSaveDraft: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		site: React.PropTypes.object,
		type: React.PropTypes.string
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps: function() {
		return {
			hasContent: false,
			isDirty: false,
			isSaveBlocked: false,
			isPublishing: false,
			isSaving: false,
			onPublish: noop,
			onSaveDraft: noop,
			post: null,
			savedPost: null,
			site: {}
		};
	},

	getInitialState: function() {
		return {
			showSchedulePopover: false,
			showAdvanceStatus: false,
			showDateTooltip: false,
			firstDayOfTheMonth: this.getFirstDayOfTheMonth(),
			lastDayOfTheMonth: this.getLastDayOfTheMonth()
		};
	},

	setPostDate: function( date ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( { date: date ? date.format() : null } );
	},

	setCurrentMonth: function( date ) {
		this.setState( {
			firstDayOfTheMonth: this.getFirstDayOfTheMonth( date ),
			lastDayOfTheMonth: this.getLastDayOfTheMonth( date )
		} );
	},

	getPreviewLabel: function() {
		if ( postUtils.isPublished( this.props.savedPost ) && this.props.site.jetpack ) {
			return this.translate( 'View' );
		}

		return this.translate( 'Preview' );
	},

	toggleSchedulePopover: function() {
		this.setState( { showSchedulePopover: ! this.state.showSchedulePopover } );
	},

	closeSchedulePopover: function( event ) {
		// if `event` is defined means that popover has been canceled (ESC key)
		if ( ! event ) {
			let date = this.props.savedPost && this.props.savedPost.date
				? this.moment( this.props.savedPost.date )
				: null;

			this.setPostDate( date );
		}

		this.setState( { showSchedulePopover: false } );
	},

	renderPostScheduler: function() {
		var tz = siteUtils.timezone( this.props.site ),
			gmtOffset = siteUtils.gmtOffset( this.props.site ),
			postDate = this.props.post && this.props.post.date
				? this.props.post.date
				: null;

		return (
			<PostSchedule
				selectedDay={ postDate }
				timezone={ tz }
				gmtOffset={ gmtOffset }
				onDateChange={ this.setPostDate }
				onMonthChange={ this.setCurrentMonth }>
			</PostSchedule>
		);
	},

	schedulePostPopover: function() {
		var postScheduler = this.renderPostScheduler();

		return (
			<Popover
				isVisible={ this.state.showSchedulePopover }
				onClose={ this.closeSchedulePopover }
				position={ 'bottom left' }
				context={ this.refs && this.refs.schedulePost }>
				<span className="editor-ground-control__schedule-post">
					{ postUtils.isPage( this.props.post )
						? postScheduler
						: <PostListFetcher
							siteID={ this.props.site.ID }
							status="publish,future"
							before={ this.state.lastDayOfTheMonth.format() }
							after={ this.state.firstDayOfTheMonth.format() }
							number={ 100 }
						>
							{ postScheduler }
						</PostListFetcher>
					}
				</span>
			</Popover>
		);
	},

	getFirstDayOfTheMonth: function( date ) {
		var tz = siteUtils.timezone( this.props.site );
		date = date || this.moment();

		return postUtils.getOffsetDate( date, tz ).set( {
			year: date.year(),
			month: date.month(),
			date: 1,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		} );
	},

	getLastDayOfTheMonth: function( date ) {
		return this.getFirstDayOfTheMonth( date )
			.add( 1, 'month' )
			.second( -1 );
	},

	isSaveEnabled: function() {
		return ! this.props.isSaving &&
			! this.props.isSaveBlocked &&
			this.props.isDirty &&
			this.props.hasContent &&
			!! this.props.post &&
			! postUtils.isPublished( this.props.post );
	},

	isPreviewEnabled: function() {
		return this.props.hasContent &&
			! ( this.props.isNew && ! this.props.isDirty ) &&
			! this.props.isSaveBlocked;
	},

	canSchedulePost: function() {
		return siteUtils.userCan( 'publish_posts', this.props.site );
	},

	toggleAdvancedStatus: function() {
		this.setState( { showAdvanceStatus: ! this.state.showAdvanceStatus } );
	},

	onSaveButtonClick: function() {
		this.props.onSave();
		const eventLabel = postUtils.isPage( this.props.page ) ? 'Clicked Save Page Button' : 'Clicked Save Post Button';
		stats.recordEvent( eventLabel );
		stats.recordStat( 'save_draft_clicked' );
	},

	onPreviewButtonClick: function( event ) {
		this.props.onPreview( event );
		const eventLabel = postUtils.isPage( this.props.page ) ? 'Clicked Preview Page Button' : 'Clicked Preview Post Button';
		stats.recordEvent( eventLabel );
	},

	renderDateTooltip: function() {
		if ( this.state.showSchedulePopover ) {
			return null;
		}

		return (
			<Tooltip
				context={ this.refs && this.refs.schedulePost }
				isVisible={ this.state.showDateTooltip }
				position="top"
				onClose={ noop }
			>
				{ this.translate( 'Set date and time' ) }
			</Tooltip>
		);
	},

	showDateTooltip: function() {
		this.setState( { showDateTooltip: true } );
	},

	hideDateTooltip: function() {
		this.setState( { showDateTooltip: false } );
	},

	render: function() {
		return (
			<Card className="editor-ground-control">
				<Site
					site={ this.props.site }
					indicator={ false }
					homeLink={ true }
					externalLink={ true }
				/>
				<hr className="editor-ground-control__separator" />
				<div className="editor-ground-control__status">
					<StatusLabel
						post={ this.props.savedPost }
						onClick={ this.toggleAdvancedStatus }
						advancedStatus={ this.state.showAdvanceStatus }
						type={ this.props.type }
					/>
					{ this.isSaveEnabled() &&
						<button
							className="editor-ground-control__save button is-link"
							onClick={ this.onSaveButtonClick }
							tabIndex={ 3 }
						>
							{ this.translate( 'Save' ) }
						</button>
					}
					{ this.props.isSaving &&
						<span className="editor-ground-control__saving">
							{ this.translate( 'Saving…' ) }
						</span>
					}
				</div>
				{
					this.state.showAdvanceStatus &&
						<EditPostStatus
							post={ this.props.post }
							savedPost={ this.props.savedPost }
							type={ this.props.type }
							onSave={ this.props.onSave }
							onTrashingPost={ this.props.onTrashingPost }
							onDateChange={ this.setPostDate }
							site={ this.props.site }>
						</EditPostStatus>
				}
				<div className="editor-ground-control__action-buttons">
					<button
						className="editor-ground-control__preview-button button"
						disabled={ ! this.isPreviewEnabled() }
						onClick={ this.onPreviewButtonClick }
						tabIndex={ 4 }
					>
						{ this.getPreviewLabel() }
					</button>
					<div className="editor-ground-control__publish-combo">
						<EditorPublishButton
							{ ...this.props }
							tabIndex={ 5 }
						/>
						{ this.canSchedulePost() &&
							<button
								ref="schedulePost"
								className="editor-ground-control__time-button button"
								onClick={ this.toggleSchedulePopover }
								onMouseEnter={ this.showDateTooltip }
								onMouseLeave={ this.hideDateTooltip }
								aria-label={ this.translate( 'Schedule date and time to publish post.' ) }
								aria-pressed={ !! this.state.showSchedulePopover }
								tabIndex={ 6 }
							>
								{ postUtils.isFutureDated( this.props.post )
									? <Gridicon icon="scheduled" size={ 18 } />
									: <Gridicon icon="calendar" size={ 18 } />
								}
								<span className="editor-ground-control__time-button__label">
									{ postUtils.isFutureDated( this.props.post )
										? this.moment( this.props.post.date ).calendar()
										: this.translate( 'Choose date' )
									}
								</span>
							</button>
						}
						{ this.renderDateTooltip() }
					</div>
					{ this.canSchedulePost() &&
						this.schedulePostPopover()
					}
				</div>
			</Card>
		);
	}
} );
