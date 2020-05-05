/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { identity, noop, get, findLast } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import Site from 'blocks/site';
import EditorPublishButton from 'post-editor/editor-publish-button';
import QuickSaveButtons from 'post-editor/editor-ground-control/quick-save-buttons';
import Drafts from 'layout/masterbar/drafts';
import { recordTracksEvent } from 'state/analytics/actions';
import { getEditorPublishButtonStatus } from 'state/ui/editor/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isVipSite from 'state/selectors/is-vip-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getRouteHistory } from 'state/ui/action-log/selectors';
import { pauseGuidedTour } from 'state/ui/guided-tours/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class EditorGroundControl extends React.Component {
	static propTypes = {
		hasContent: PropTypes.bool,
		isConfirmationSidebarEnabled: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		isDirty: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		isPublishing: PropTypes.bool,
		isSaving: PropTypes.bool,
		isSidebarOpened: PropTypes.bool,
		onPreview: PropTypes.func,
		onPublish: PropTypes.func,
		onSave: PropTypes.func,
		onSaveDraft: PropTypes.func,
		onMoreInfoAboutEmailVerify: PropTypes.func,
		setPostDate: PropTypes.func,
		site: PropTypes.object,
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
		onPublish: noop,
		onSaveDraft: noop,
		site: {},
		translate: identity,
		setPostDate: noop,
	};

	getPreviewLabel() {
		return this.props.translate( 'Preview' );
	}

	getVerificationNoticeLabel() {
		const { translate, publishButtonStatus } = this.props;

		switch ( publishButtonStatus ) {
			case 'update':
				return translate( 'To update, check your email and confirm your address.' );
			case 'schedule':
				return translate( 'To schedule, check your email and confirm your address.' );
			case 'publish':
				return translate( 'To publish, check your email and confirm your address.' );
			case 'requestReview':
				return translate( 'To submit for review, check your email and confirm your address.' );
			default:
				return null;
		}
	}

	isPreviewEnabled() {
		return (
			this.props.hasContent &&
			! ( this.props.isNew && ! this.props.isDirty ) &&
			! this.props.isSaveBlocked
		);
	}

	onPreviewButtonClick = ( event ) => {
		if ( this.isPreviewEnabled() ) {
			this.props.onPreview( event );
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
				>
					<span className="editor-ground-control__button-label">{ this.getPreviewLabel() }</span>
				</Button>
				<div className="editor-ground-control__publish-button">
					<EditorPublishButton
						onSave={ this.props.onSave }
						onPublish={ this.props.onPublish }
						isConfirmationSidebarEnabled={ this.props.isConfirmationSidebarEnabled }
						isSaving={ this.props.isSaving }
						isPublishing={ this.props.isPublishing }
						isSaveBlocked={ this.props.isSaveBlocked }
						hasContent={ this.props.hasContent }
						needsVerification={ this.props.userNeedsVerification }
					/>
				</div>
			</div>
		);
	}

	getCloseButtonPath() {
		const editorPathRegex = /^(\/block-editor)?\/(post|page|(edit\/[^/]+))(\/|$)/i;
		// find the last non-editor path in routeHistory, default to "all posts"
		const lastNonEditorPath = findLast(
			this.props.routeHistory,
			( { path } ) => '/block-editor' !== path && ! path.match( editorPathRegex )
		);
		return lastNonEditorPath ? lastNonEditorPath.path : this.props.allPostsUrl;
	}

	onCloseButtonClick = () => {
		this.props.recordCloseButtonClick();
		this.props.pauseEditorTour();
		page.show( this.getCloseButtonPath() );
	};

	render() {
		const {
			isSaving,
			isSaveBlocked,
			isDirty,
			hasContent,
			onSave,
			translate,
			userNeedsVerification,
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
					indicator={ false }
				/>
				<Drafts />
				{ userNeedsVerification && (
					<button
						className="editor-ground-control__email-verification-notice"
						onClick={ this.props.onMoreInfoAboutEmailVerify }
					>
						<Gridicon
							icon="info"
							className="editor-ground-control__email-verification-notice-icon"
						/>
						{ this.getVerificationNoticeLabel() }{ ' ' }
						<span className="editor-ground-control__email-verification-notice-more">
							{ translate( 'Learn More' ) }
						</span>
					</button>
				) }
				<QuickSaveButtons
					isSaving={ isSaving }
					isSaveBlocked={ isSaveBlocked }
					isDirty={ isDirty }
					hasContent={ hasContent }
					onSave={ onSave }
				/>
				{ this.renderGroundControlActionButtons() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const siteId = get( ownProps, 'site.ID', null );

	return {
		publishButtonStatus: getEditorPublishButtonStatus( state ),
		routeHistory: getRouteHistory( state ),
		// do not allow publish for unverified e-mails, but allow if the site is VIP, or if the site is unlaunched
		userNeedsVerification:
			! isCurrentUserEmailVerified( state ) &&
			! isVipSite( state, siteId ) &&
			! isUnlaunchedSite( state, siteId ),
	};
};

const mapDispatchToProps = {
	recordSiteButtonClick: () => recordTracksEvent( 'calypso_editor_site_button_click' ),
	recordCloseButtonClick: () => recordTracksEvent( 'calypso_editor_close_button_click' ),
	pauseEditorTour: () => pauseGuidedTour(),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( EditorGroundControl ) );
