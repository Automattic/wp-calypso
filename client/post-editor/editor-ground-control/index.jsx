/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { identity, noop } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import page from 'page';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'gridicons';
import Popover from 'components/popover';
import Site from 'blocks/site';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import { recordEvent, recordStat } from 'lib/posts/stats';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';
import PostScheduler from './post-scheduler';
import { NESTED_SIDEBAR_REVISIONS, NestedSidebarPropType } from 'post-editor/editor-sidebar/constants';

export class EditorGroundControl extends PureComponent {
	static propTypes = {
		hasContent: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		isDirty: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		isPublishing: PropTypes.bool,
		isSaving: PropTypes.bool,
		nestedSidebar: NestedSidebarPropType,
		moment: PropTypes.func,
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
		translate: PropTypes.func,
		type: PropTypes.string,
	}

	static defaultProps = {
		hasContent: false,
		isConfirmationSidebarEnabled: true,
		isDirty: false,
		isSaveBlocked: false,
		isPublishing: false,
		isSaving: false,
		moment,
		onPublish: noop,
		onSaveDraft: noop,
		post: null,
		savedPost: null,
		site: {},
		translate: identity,
		user: null,
		userUtils: null,
		setPostDate: noop,
	}

	state = {
		showSchedulePopover: false,
		showAdvanceStatus: false,
		needsVerification: this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
	}

	componentDidMount() {
		if ( ! this.props.user ) {
			return;
		}

		this.props.user
			.on( 'change', this.updateNeedsVerification )
			.on( 'verify', this.updateNeedsVerification );
	}

	componentWillUnmount() {
		if ( ! this.props.user ) {
			return;
		}

		this.props.user
			.off( 'change', this.updateNeedsVerification )
			.off( 'verify', this.updateNeedsVerification );
	}

	updateNeedsVerification = () => {
		this.setState( {
			needsVerification: this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
		} );
	}

	componentWillReceiveProps( nextProps ) {
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
	}

	getPreviewLabel() {
		if ( postUtils.isPublished( this.props.savedPost ) && this.props.site.jetpack ) {
			return this.props.translate( 'View' );
		}

		return this.props.translate( 'Preview' );
	}

	getVerificationNoticeLabel() {
		const primaryButtonState = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost ),
			buttonLabels = {
				update: i18n.translate( 'To update, check your email and confirm your address.' ),
				schedule: i18n.translate( 'To schedule, check your email and confirm your address.' ),
				publish: i18n.translate( 'To publish, check your email and confirm your address.' ),
				requestReview: i18n.translate( 'To submit for review, check your email and confirm your address.' ),
			};

		return buttonLabels[ primaryButtonState ];
	}

	toggleSchedulePopover = () => {
		this.setState( { showSchedulePopover: ! this.state.showSchedulePopover } );
	}

	closeSchedulePopover = ( wasCanceled ) => {
		if ( wasCanceled ) {
			const date = this.props.savedPost && this.props.savedPost.date
				? this.props.moment( this.props.savedPost.date )
				: null;

			this.props.setPostDate( date );
		}

		this.setState( { showSchedulePopover: false } );
	}

	schedulePostPopover() {
		return (
			<Popover
				isVisible={ this.state.showSchedulePopover }
				onClose={ this.closeSchedulePopover }
				position={ 'bottom left' }
				context={ this.refs && this.refs.schedulePost }
				id="editor-post-schedule"
				className="editor-ground-control__post-schedule-popover"
			>
				<PostScheduler initialDate={ this.props.moment() }
					post={ this.props.post }
					setPostDate= { this.props.setPostDate }
					site={ this.props.site } />
			</Popover>
		);
	}

	getSaveStatusLabel() {
		if ( this.props.isSaving ) {
			return this.props.translate( 'Saving…' );
		}

		if ( ! this.props.post || postUtils.isPublished( this.props.post ) || ! this.props.post.ID ) {
			return null;
		}

		return this.props.translate( 'Saved' );
	}

	isSaveEnabled() {
		return ! this.props.isSaving &&
			! this.props.isSaveBlocked &&
			this.props.isDirty &&
			this.props.hasContent &&
			!! this.props.post &&
			! postUtils.isPublished( this.props.post );
	}

	isPreviewEnabled() {
		return this.props.hasContent &&
			! ( this.props.isNew && ! this.props.isDirty ) &&
			! this.props.isSaveBlocked;
	}

	canPublishPost() {
		return siteUtils.userCan( 'publish_posts', this.props.site );
	}

	toggleAdvancedStatus = () => {
		this.setState( { showAdvanceStatus: ! this.state.showAdvanceStatus } );
	}

	onSaveButtonClick = () => {
		this.props.onSave();
		const eventLabel = postUtils.isPage( this.props.page ) ? 'Clicked Save Page Button' : 'Clicked Save Post Button';
		recordEvent( eventLabel );
		recordStat( 'save_draft_clicked' );
	}

	onPreviewButtonClick = ( event ) => {
		if ( this.isPreviewEnabled() ) {
			this.props.onPreview( event );
			const eventLabel = postUtils.isPage( this.props.page ) ? 'Clicked Preview Page Button' : 'Clicked Preview Post Button';
			recordEvent( eventLabel );
		}
	}

	renderGroundControlActionButtons() {
		if ( this.props.confirmationSidebarStatus === 'open' ) {
			return;
		}

		const publishComboClasses = classNames( 'editor-ground-control__publish-combo', {
			'is-standalone': ! this.canPublishPost() || this.props.isConfirmationSidebarEnabled
		} );

		return (
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
					<Gridicon icon={ this.props.nestedSidebar === NESTED_SIDEBAR_REVISIONS ? 'history' : 'cog' } />
					<span className="editor-ground-control__button-label"> <EditorPostType isSettings /></span>
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
						aria-label={ this.props.translate( 'Schedule date and time to publish post.' ) }
						aria-pressed={ !! this.state.showSchedulePopover }
						title={ this.props.translate( 'Set date and time' ) }
						tabIndex={ 6 }
					>
						{ postUtils.isFutureDated( this.props.post )
							? <Gridicon icon="scheduled" />
							: <Gridicon icon="calendar" />
						}
						<span className="editor-ground-control__time-button-label">
										{ postUtils.isFutureDated( this.props.post )
											? this.props.moment( this.props.post.date ).calendar()
											: this.props.translate( 'Choose Date' )
										}
									</span>
					</Button>
					}
				</div>
				{ this.canPublishPost() &&
				! this.props.isConfirmationSidebarEnabled &&
				this.schedulePostPopover()
				}
			</div>
		);
	}

	render() {
		return (
			<Card className="editor-ground-control">
				<Button
					borderless
					className="editor-ground-control__back"
					href={ '' }
					onClick={ page.back.bind( page, this.props.allPostsUrl ) }
					aria-label={ this.props.translate( 'Go back' ) }
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
						<span className="editor-ground-control__email-verification-notice-more">
							{ this.props.translate( 'Learn More' ) }
						</span>
					</div>
				}
				<div className="editor-ground-control__status">
					{ this.isSaveEnabled() &&
						<button
							className="editor-ground-control__save button is-link"
							onClick={ this.onSaveButtonClick }
							tabIndex={ 3 }
						>
							{ this.props.translate( 'Save' ) }
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
}

export default localize( EditorGroundControl );
