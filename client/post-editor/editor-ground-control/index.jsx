/**
 * External dependencies
 */
const noop = require( 'lodash/noop' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	i18n = require( 'i18n-calypso' );
import page from 'page';

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	Gridicon = require( 'gridicons' ),
	Popover = require( 'components/popover' ),
	Site = require( 'blocks/site' ),
	postUtils = require( 'lib/posts/utils' ),
	siteUtils = require( 'lib/site/utils' ),
	PostListFetcher = require( 'components/post-list-fetcher' ),
	stats = require( 'lib/posts/stats' );

import AsyncLoad from 'components/async-load';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';

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
		setPostDate: React.PropTypes.func,
		site: React.PropTypes.object,
		user: React.PropTypes.object,
		userUtils: React.PropTypes.object,
		toggleSidebar: React.PropTypes.func,
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
			setPostDate: noop
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
		const primaryButtonState = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost ),
			buttonLabels = {
				update: i18n.translate( 'To update, check your email and confirm your address.' ),
				schedule: i18n.translate( 'To schedule, check your email and confirm your address.' ),
				publish: i18n.translate( 'To publish, check your email and confirm your address.' ),
				requestReview: i18n.translate( 'To submit for review, check your email and confirm your address.' ),
			};

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
				onDateChange={ this.props.setPostDate }
				onMonthChange={ this.setCurrentMonth }
				site={ this.props.site }
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

	getSaveStatusLabel: function() {
		if ( this.props.isSaving ) {
			return this.translate( 'Saving…' );
		}

		if ( ! this.props.post || postUtils.isPublished( this.props.post ) || ! this.props.post.ID ) {
			return null;
		}

		return this.translate( 'Saved' );
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
		if ( this.isPreviewEnabled() ) {
			this.props.onPreview( event );
			const eventLabel = postUtils.isPage( this.props.page ) ? 'Clicked Preview Page Button' : 'Clicked Preview Post Button';
			stats.recordEvent( eventLabel );
		}
	},

	render: function() {
		return (
			<Card className="editor-ground-control">
				<Button
					borderless
					className="editor-ground-control__back"
					href={ '' }
					onClick={ page.back.bind( page, this.props.allPostsUrl ) }
					aria-label={ this.translate( 'Go back' ) }
				>
					<Gridicon icon="arrow-left" />
				</Button>
				<Site
					compact
					site={ this.props.site }
					indicator={ false }
					homeLink={ true }
					externalLink={ true }
				/>
				{ this.state.needsVerification &&
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
				<div className="editor-ground-control__status">
					{ this.isSaveEnabled() &&
						<button
							className="editor-ground-control__save button is-link"
							onClick={ this.onSaveButtonClick }
							tabIndex={ 3 }
						>
							{ this.translate( 'Save' ) }
						</button>
					}
					{ ! this.isSaveEnabled() &&
						<span className="editor-ground-control__save-status">
							{ this.getSaveStatusLabel() }
						</span>
					}
				</div>
				<div className="editor-ground-control__action-buttons">
					<Button
						borderless
						className="editor-ground-control__preview-button"
						disabled={ ! this.isPreviewEnabled() }
						onClick={ this.onPreviewButtonClick }
						tabIndex={ 4 }
					>
						<Gridicon icon="visible" /> <span className="editor-ground-control__button-label">{ this.getPreviewLabel() }</span>
					</Button>
					<Button
						borderless
						className="editor-ground-control__toggle-sidebar"
						onClick={ this.props.toggleSidebar }
					>
						<Gridicon icon="cog" /> <span className="editor-ground-control__button-label"><EditorPostType isSettings /></span>
					</Button>
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
							busy={ this.props.isPublishing || ( postUtils.isPublished( this.props.savedPost ) && this.props.isSaving ) }
						/>
						{ this.canPublishPost() &&
							<Button
								primary
								compact
								ref="schedulePost"
								className="editor-ground-control__time-button"
								onClick={ this.toggleSchedulePopover }
								aria-label={ this.translate( 'Schedule date and time to publish post.' ) }
								aria-pressed={ !! this.state.showSchedulePopover }
								title={ this.translate( 'Set date and time' ) }
								tabIndex={ 6 }
							>
								{ postUtils.isFutureDated( this.props.post )
									? <Gridicon icon="scheduled" />
									: <Gridicon icon="calendar" />
								}
								<span className="editor-ground-control__time-button-label">
									{ postUtils.isFutureDated( this.props.post )
										? this.moment( this.props.post.date ).calendar()
										: this.translate( 'Choose Date' )
									}
								</span>
							</Button>
						}
					</div>
					{ this.canPublishPost() &&
						this.schedulePostPopover()
					}
				</div>
			</Card>
		);
	}
} );
