/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { identity, noop, get, findLast } from 'lodash';
import moment from 'moment';
import page from 'page';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Site from 'blocks/site';
import EditorPublishButton from 'post-editor/editor-publish-button';
import Button from 'components/button';
import QuickSaveButtons from 'post-editor/editor-ground-control/quick-save-buttons';
import Drafts from 'layout/masterbar/drafts';
import { recordTracksEvent } from 'state/analytics/actions';
import { getEditorPublishButtonStatus } from 'state/ui/editor/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getRouteHistory } from 'state/ui/action-log/selectors';

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
		moment: PropTypes.func,
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
		moment,
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

	onPreviewButtonClick = event => {
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
					tabIndex={ 4 }
				>
					<span className="editor-ground-control__button-label">{ this.getPreviewLabel() }</span>
				</Button>
				<div className="editor-ground-control__publish-button">
					<EditorPublishButton
						onSave={ this.props.onSave }
						onPublish={ this.props.onPublish }
						tabIndex={ 5 }
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
		// find the last non-editor path in routeHistory, default to "all posts"
		const lastNonEditorPath = findLast(
			this.props.routeHistory,
			action => ! action.path.match( /^\/(post|page|edit)($|\/)/i )
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
		// do not allow publish for unverified e-mails, but allow if the site is VIP
		userNeedsVerification: ! isCurrentUserEmailVerified( state ) && ! isVipSite( state, siteId ),
	};
};

const mapDispatchToProps = {
	recordSiteButtonClick: () => recordTracksEvent( 'calypso_editor_site_button_click' ),
	recordCloseButtonClick: () => recordTracksEvent( 'calypso_editor_close_button_click' ),
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EditorGroundControl ) );
