/**
 * External dependencies
 */
const noop = require( 'lodash/noop' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	EditPostStatus = require( 'post-editor/edit-post-status' ),
	Gridicon = require( 'components/gridicon' ),
	Popover = require( 'components/popover' ),
	Site = require( 'blocks/site' ),
	StatusLabel = require( 'post-editor/editor-status-label' ),
	postUtils = require( 'lib/posts/utils' ),
	siteUtils = require( 'lib/site/utils' ),
	postActions = require( 'lib/posts/actions' ),
	Tooltip = require( 'components/tooltip' ),
	PostListFetcher = require( 'components/post-list-fetcher' ),
	stats = require( 'lib/posts/stats' );

import AsyncLoad from 'components/async-load';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';

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
		onSave: React.PropTypes.func,
		onSaveDraft: React.PropTypes.func,
		onMoreInfoAboutEmailVerify: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		site: React.PropTypes.object,
		user: React.PropTypes.object,
		userUtils: React.PropTypes.object,
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
			site: {},
			user: null,
			userUtils: null,
			setDate: noop
		};
	},

	componentDidMount: function() {
		if ( ! this.props.user ) {
			return;
		}

		this.props.user
			.on( 'change', this.updateNeedsVerification )
			.on( 'verify', this.updateNeedsVerification );
	},

	componentWillUnmount: function() {
		if ( ! this.props.user ) {
			return;
		}

		this.props.user
			.off( 'change', this.updateNeedsVerification )
			.off( 'verify', this.updateNeedsVerification );
	},

	updateNeedsVerification: function() {
		this.setState( {
			needsVerification: this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
		} );
	},

	getInitialState: function() {
		return {
			showSchedulePopover: false,
			showAdvanceStatus: false,
			showDateTooltip: false,
			firstDayOfTheMonth: this.getFirstDayOfTheMonth(),
			lastDayOfTheMonth: this.getLastDayOfTheMonth(),
			needsVerification: this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( {
			needsVerification: nextProps.userUtils && nextProps.userUtils.needsVerificationForSite( nextProps.site ),
		} );

		if ( this.props.user ) {
			this.props.user
				.off( 'change', this.updateNeedsVerification )
				.off( 'verify', this.updateNeedsVerification );
		}

		if ( nextProps.user ) {
			nextProps.user
				.on( 'change', this.updateNeedsVerification )
				.on( 'verify', this.updateNeedsVerification );
		}
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

	getVerificationNoticeLabel: function() {
		const primaryButtonState = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost );
		let buttonLabels;

		// TODO: switch entirely to new wording once translations catch up
		if ( i18n.getLocaleSlug() === 'en' ) {
			buttonLabels = {
				update: this.translate( 'To update, check your email and confirm your address.' ),
				schedule: this.translate( 'To schedule, check your email and confirm your address.' ),
				publish: this.translate( 'To publish, check your email and confirm your address.' ),
				requestReview: this.translate( 'To submit for review, check your email and confirm your address.' ),
			};
		} else {
			buttonLabels = {
				update: this.translate( 'To update, please confirm your email address.' ),
				schedule: this.translate( 'To schedule, please confirm your email address.' ),
				publish: this.translate( 'To publish, please confirm your email address.' ),
				requestReview: this.translate( 'To submit for review, please confirm your email address.' ),
			};
		}
		return buttonLabels[ primaryButtonState ];
	},

	toggleSchedulePopover: function() {
		this.setState( { showSchedulePopover: ! this.state.showSchedulePopover } );
	},

	closeSchedulePopover: function( wasCanceled ) {
		if ( wasCanceled ) {
			const date = this.props.savedPost && this.props.savedPost.date
				? this.moment( this.props.savedPost.date )
				: null;

			this.setPostDate( date );
		}

		this.setState( { showSchedulePopover: false } );
	},

	renderPostScheduler: function() {
		const tz = siteUtils.timezone( this.props.site ),
			gmtOffset = siteUtils.gmtOffset( this.props.site ),
			postDate = this.props.post && this.props.post.date
				? this.props.post.date
				: null;

		return (
			<AsyncLoad
				require="components/post-schedule"
				selectedDay={ postDate }
				timezone={ tz }
				gmtOffset={ gmtOffset }
				onDateChange={ this.setPostDate }
				onMonthChange={ this.setCurrentMonth }
			/>
		);
	},

	schedulePostPopover: function() {
		const postScheduler = this.renderPostScheduler();

		return (
			<Popover
				isVisible={ this.state.showSchedulePopover }
				onClose={ this.closeSchedulePopover }
				position={ 'bottom left' }
				context={ this.refs && this.refs.schedulePost }
				id="editor-post-schedule"
			>
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
		const tz = siteUtils.timezone( this.props.site );
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

	canPublishPost: function() {
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
							site={ this.props.site }
							post={ this.props.post }
							savedPost={ this.props.savedPost }
							onSave={ this.props.onSave }
							onPublish={ this.props.onPublish }
							tabIndex={ 5 }
							isPublishing={ this.props.isPublishing }
							isSaveBlocked={ this.props.isSaveBlocked }
							hasContent={ this.props.hasContent }
							needsVerification={ this.state.needsVerification }
						/>
						{ this.canPublishPost() &&
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
								<span className="editor-ground-control__time-button-label">
									{ postUtils.isFutureDated( this.props.post )
										? this.moment( this.props.post.date ).calendar()
										: this.translate( 'Choose Date' )
									}
								</span>
							</button>
						}
						{ this.renderDateTooltip() }
					</div>
					{ this.canPublishPost() &&
						this.schedulePostPopover()
					}
				</div>
				{
					this.state.needsVerification &&
					<div className="editor-ground-control__email-verification-notice"
						tabIndex={ 7 }
						onClick={ this.props.onMoreInfoAboutEmailVerify }>
						<Gridicon
							icon="info"
							className="editor-ground-control__email-verification-notice-icon" />
						{ this.getVerificationNoticeLabel() }
						{ ' ' }
						<span className="editor-ground-control__email-verification-notice-more">{ this.translate( 'Learn More' ) }</span>
					</div>
				}
			</Card>
		);
	}
} );
