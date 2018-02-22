/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { identity, noop, get, findLast } from 'lodash';
import moment from 'moment';
import page from 'page';
import i18n, { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Site from 'blocks/site';
import * as postUtils from 'lib/posts/utils';
import EditorPublishButton, { getPublishButtonStatus } from 'post-editor/editor-publish-button';
import Button from 'components/button';
import QuickSaveButtons from 'post-editor/editor-ground-control/quick-save-buttons';
import Drafts from 'layout/masterbar/drafts';
import { composeAnalytics, recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { canCurrentUser } from 'state/selectors';
import { getRouteHistory } from 'state/ui/action-log/selectors';

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
				this.props.post,
				this.props.savedPost,
				this.props.canUserPublishPosts
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

	isPreviewEnabled() {
		return (
			this.props.hasContent &&
			! ( this.props.isNew && ! this.props.isDirty ) &&
			! this.props.isSaveBlocked
		);
	}

	toggleAdvancedStatus = () => {
		this.setState( { showAdvanceStatus: ! this.state.showAdvanceStatus } );
	};

	onPreviewButtonClick = event => {
		if ( this.isPreviewEnabled() ) {
			this.props.onPreview( event );
			this.props.recordPreviewButtonClick( this.props.post );
		}
	};

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

	getCloseButtonPath() {
		// find the last non-editor path in routeHistory, default to "all posts"
		const lastNonEditorPath = findLast(
			this.props.routeHistory,
			action => ! action.path.match( /^\/(post|page|(edit\/[^\/]+))\/[^\/]+(\/\d+)?$/i )
		);
		return lastNonEditorPath ? lastNonEditorPath.path : this.props.allPostsUrl;
	}

	onCloseButtonClick = () => {
		this.props.recordCloseButtonClick();
		page.show( this.getCloseButtonPath() );
	};

	render() {
		const {
			isSaving,
			isSaveBlocked,
			isDirty,
			hasContent,
			loadRevision,
			post,
			onSave,
			translate,
		} = this.props;

		return (
			<Card className="editor-ground-control">
				<Button
					borderless
					className="editor-ground-control__back"
					href={ '' }
					onClick={ this.onCloseButtonClick }
					aria-label={ translate( 'Close' ) }
				>
					{ translate( 'Close' ) }
				</Button>
				<Site
					compact
					site={ this.props.site }
					onSelect={ this.props.recordSiteButtonClick }
					indicator={ true }
				/>
				<Drafts />
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
				<QuickSaveButtons
					isSaving={ isSaving }
					isSaveBlocked={ isSaveBlocked }
					isDirty={ isDirty }
					hasContent={ hasContent }
					loadRevision={ loadRevision }
					post={ post }
					onSave={ onSave }
				/>
				{ this.renderGroundControlActionButtons() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const siteId = get( ownProps, 'site.ID', null );

	const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );

	return {
		canUserPublishPosts,
		routeHistory: getRouteHistory( state ),
	};
};

const mapDispatchToProps = {
	recordPreviewButtonClick: post => {
		const postIsPage = postUtils.isPage( post );
		return composeAnalytics(
			recordTracksEvent( `calypso_editor_${ postIsPage ? 'page' : 'post' }_preview_button_click` ),
			recordGoogleEvent(
				'Editor',
				`Clicked Preview ${ postIsPage ? 'Page' : 'Post' } Button`,
				`Editor Preview ${ postIsPage ? 'Page' : 'Post' } Button Clicked`,
				`editor${ postIsPage ? 'Page' : 'Post' }ButtonClicked`
			)
		);
	},
	recordSiteButtonClick: () => recordTracksEvent( 'calypso_editor_site_button_click' ),
	recordCloseButtonClick: () => recordTracksEvent( 'calypso_editor_close_button_click' ),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( EditorGroundControl ) );
