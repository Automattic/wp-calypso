/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get, identity, noop } from 'lodash';
import moment from 'moment';
import page from 'page';
import i18n, { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Card from 'components/card';
import Site from 'blocks/site';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import { recordEvent, recordStat } from 'lib/posts/stats';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import Button from 'components/button';
import HistoryButton from 'post-editor/editor-ground-control/history-button';

export class EditorGroundControl extends PureComponent {
	static propTypes = {
		hasContent: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		isDirty: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		isPublishing: PropTypes.bool,
		isSaving: PropTypes.bool,
		isSidebarOpened: PropTypes.bool,
		loadRevision: PropTypes.func.isRequired,
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
	};

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
	};

	state = {
		showAdvanceStatus: false,
		needsVerification:
			this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
	};

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
			needsVerification:
				this.props.userUtils && this.props.userUtils.needsVerificationForSite( this.props.site ),
		} );
	};

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			needsVerification:
				nextProps.userUtils && nextProps.userUtils.needsVerificationForSite( nextProps.site ),
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
		return this.props.translate( 'Preview' );
	}

	getVerificationNoticeLabel() {
		const primaryButtonState = getPublishButtonStatus(
				this.props.site,
				this.props.post,
				this.props.savedPost
			),
			buttonLabels = {
				update: i18n.translate( 'To update, check your email and confirm your address.' ),
				schedule: i18n.translate( 'To schedule, check your email and confirm your address.' ),
				publish: i18n.translate( 'To publish, check your email and confirm your address.' ),
				requestReview: i18n.translate(
					'To submit for review, check your email and confirm your address.'
				),
			};

		return buttonLabels[ primaryButtonState ];
	}

	shouldShowStatusLabel() {
		const { isSaving, post } = this.props;

		return isSaving || ( post && post.ID && ! postUtils.isPublished( post ) );
	}

	isSaveAvailable() {
		return (
			! this.props.isSaving &&
			! this.props.isSaveBlocked &&
			this.props.isDirty &&
			this.props.hasContent &&
			!! this.props.post &&
			! postUtils.isPublished( this.props.post )
		);
	}

	isPreviewEnabled() {
		return (
			this.props.hasContent &&
			! ( this.props.isNew && ! this.props.isDirty ) &&
			! this.props.isSaveBlocked
		);
	}

	canPublishPost() {
		return siteUtils.userCan( 'publish_posts', this.props.site );
	}

	toggleAdvancedStatus = () => {
		this.setState( { showAdvanceStatus: ! this.state.showAdvanceStatus } );
	};

	onSaveButtonClick = () => {
		this.props.onSave();
		const eventLabel = postUtils.isPage( this.props.page )
			? 'Clicked Save Page Button'
			: 'Clicked Save Post Button';
		recordEvent( eventLabel );
		recordStat( 'save_draft_clicked' );
	};

	onPreviewButtonClick = event => {
		if ( this.isPreviewEnabled() ) {
			this.props.onPreview( event );
			const eventLabel = postUtils.isPage( this.props.page )
				? 'Clicked Preview Page Button'
				: 'Clicked Preview Post Button';
			recordEvent( eventLabel );
		}
	};

	renderGroundControlQuickSaveButtons() {
		const { isSaving, loadRevision, post, translate } = this.props;

		const isSaveAvailable = this.isSaveAvailable();
		const showingStatusLabel = this.shouldShowStatusLabel();
		const showingSaveStatus = isSaveAvailable || showingStatusLabel;
		const hasRevisions =
			isEnabled( 'post-editor/revisions' ) &&
			postUtils.deviceSupportsRevisions() &&
			get( post, 'revisions.length' );

		if ( ! ( showingSaveStatus || hasRevisions ) ) {
			return;
		}

		return (
			<div className="editor-ground-control__quick-save">
				{ hasRevisions && <HistoryButton loadRevision={ loadRevision } /> }
				{ showingSaveStatus && (
					<div className="editor-ground-control__status">
						{ isSaveAvailable && (
							<button
								className="editor-ground-control__save button is-link"
								onClick={ this.onSaveButtonClick }
								tabIndex={ 3 }
							>
								{ translate( 'Save' ) }
							</button>
						) }
						{ ! isSaveAvailable &&
							showingStatusLabel && (
								<span
									className="editor-ground-control__save-status"
									data-e2e-status={ isSaving ? 'Saving…' : 'Saved' }
								>
									{ isSaving ? translate( 'Saving…' ) : translate( 'Saved' ) }
								</span>
							) }
					</div>
				) }
			</div>
		);
	}

	renderGroundControlActionButtons() {
		if ( this.props.confirmationSidebarStatus === 'open' ) {
			return;
		}

		return (
			<div className="editor-ground-control__action-buttons">
				<Button
					borderless
					className="editor-ground-control__toggle-sidebar"
					onClick={ this.props.toggleSidebar }
				>
					<Gridicon icon="cog" />
				</Button>
				<Button
					className="editor-ground-control__preview-button"
					disabled={ ! this.isPreviewEnabled() }
					onClick={ this.onPreviewButtonClick }
					tabIndex={ 4 }
				>
					<span className="editor-ground-control__button-label">{ this.getPreviewLabel() }</span>
				</Button>
				<div className="editor-ground-control__publish-button">
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
						busy={
							this.props.isPublishing ||
							( postUtils.isPublished( this.props.savedPost ) && this.props.isSaving )
						}
					/>
				</div>
			</div>
		);
	}

	onBackButtonClick = () => {
		page.back( this.props.allPostsUrl );
	};

	render() {
		const { translate } = this.props;

		return (
			<Card className="editor-ground-control">
				<Button
					borderless
					className="editor-ground-control__back"
					href={ '' }
					onClick={ this.onBackButtonClick }
					aria-label={ translate( 'Close' ) }
				>
					{ translate( 'Close' ) }
				</Button>
				<Site
					compact
					site={ this.props.site }
					indicator={ false }
					homeLink={ true }
					externalLink={ true }
				/>
				{ this.state.needsVerification && (
					<div
						className="editor-ground-control__email-verification-notice"
						tabIndex={ 7 }
						onClick={ this.props.onMoreInfoAboutEmailVerify }
					>
						<Gridicon
							icon="info"
							className="editor-ground-control__email-verification-notice-icon"
						/>
						{ this.getVerificationNoticeLabel() }{' '}
						<span className="editor-ground-control__email-verification-notice-more">
							{ translate( 'Learn More' ) }
						</span>
					</div>
				) }
				{ this.renderGroundControlQuickSaveButtons() }
				{ this.renderGroundControlActionButtons() }
			</Card>
		);
	}
}

export default localize( EditorGroundControl );
