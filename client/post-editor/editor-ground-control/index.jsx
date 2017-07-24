/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import PureRenderMixin from 'react-pure-render/mixin';
import { noop } from 'lodash';
import classNames from 'classnames';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'gridicons';
import Popover from 'components/popover';
import Site from 'blocks/site';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import PostListFetcher from 'components/post-list-fetcher';
import stats from 'lib/posts/stats';
import AsyncLoad from 'components/async-load';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';

export default React.createClass( {
	displayName: 'EditorGroundControl',

	propTypes: {
		hasContent: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
		isDirty: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		isPublishing: PropTypes.bool,
		isSaving: PropTypes.bool,
		onPreview: PropTypes.func,
		onPublish: PropTypes.func,
		onSave: PropTypes.func,
		onSaveDraft: PropTypes.func,
		onMoreInfoAboutEmailVerify: PropTypes.func,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		setPostDate: PropTypes.func,
		site: PropTypes.object,
		user: PropTypes.object,
		userUtils: PropTypes.object,
		toggleSidebar: PropTypes.func,
		type: PropTypes.string
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps: function() {
		return {
			hasContent: false,
			isConfirmationSidebarEnabled: true,
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

			this.props.setPostDate( date );
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
							siteId={ this.props.site.ID }
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

	renderGroundControlActionButtons: function() {
		const publishComboClasses = classNames( 'editor-ground-control__publish-combo', {
			'is-standalone': ! this.canPublishPost() || this.props.isConfirmationSidebarEnabled
		} );

		return ( <div className="editor-ground-control__action-buttons">
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
			<div className={ publishComboClasses }>
				<EditorPublishButton
					site={ this.props.site }
					post={ this.props.post }
					savedPost={ this.props.savedPost }
					onSave={ this.props.onSave }
					onPublish={ this.props.onPublish }
					tabIndex={ 5 }
					isConfirmationSidebarEnabled={ this.props.isConfirmationSidebarEnabled }
					isPublishing={ this.props.isPublishing }
					isSaveBlocked={ this.props.isSaveBlocked }
					hasContent={ this.props.hasContent }
					needsVerification={ this.state.needsVerification }
					busy={ this.props.isPublishing || ( postUtils.isPublished( this.props.savedPost ) && this.props.isSaving ) }
				/>
				{ this.canPublishPost() &&
				! this.props.isConfirmationSidebarEnabled &&
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
			! this.props.isConfirmationSidebarEnabled &&
			this.schedulePostPopover()
			}
		</div> );
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
				{ this.renderGroundControlActionButtons() }
			</Card>
		);
	}
} );
