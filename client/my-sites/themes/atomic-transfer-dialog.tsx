import { Dialog } from '@automattic/components';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import Notice from 'calypso/components/notice';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	acceptAtomicTransferDialog,
	dismissAtomicTransferDialog,
	acceptActivationModal,
	activate as activateTheme,
	initiateThemeTransfer,
} from 'calypso/state/themes/actions';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeForAtomicTransferDialog,
	isExternallyManagedTheme,
	shouldShowAtomicTransferDialog,
} from 'calypso/state/themes/selectors';
import { isUploadInProgress, getUploadError } from 'calypso/state/themes/upload-theme/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Theme } from 'calypso/types';
import './atomic-transfer-dialog.scss';

interface AtomicTransferDialogProps {
	siteId?: number;
	inProgress?: boolean;
	showEligibility: boolean;
	theme: Theme;
	siteSlug?: string | null;
	isMarketplaceProduct?: boolean;
	activeTheme?: string | null;
	uploadError?: boolean;
	isJetpack?: boolean;
	dispatchAcceptAtomicTransferDialog: typeof acceptAtomicTransferDialog;
	dispatchDismissAtomicTransferDialog: typeof dismissAtomicTransferDialog;
	dispatchAcceptActivationModal: typeof acceptActivationModal;
	dispatchActivateTheme: typeof activateTheme;
	dispatchInitiateThemeTransfer: typeof initiateThemeTransfer;
}

type AtomicTransferDialogState = {
	requestActiveThemeCount: number;
	errorMessage: string | null;
};

class AtomicTransferDialog extends Component< AtomicTransferDialogProps > {
	state: AtomicTransferDialogState;

	maxRequestActiveThemeAttempts = 30;

	constructor( props: AtomicTransferDialogProps ) {
		super( props );
		this.state = {
			requestActiveThemeCount: 0,
			errorMessage: null,
		};
	}

	handleAccept() {
		this.setState( { errorMessage: null } );
		this.initiateTransfer();
	}

	exceededMaxAttempts() {
		return this.state.requestActiveThemeCount > this.maxRequestActiveThemeAttempts;
	}

	initiateTransfer() {
		const { siteId, dispatchInitiateThemeTransfer } = this.props;

		if ( ! siteId ) {
			return;
		}

		if ( this.exceededMaxAttempts() ) {
			this.setState( {
				requestActiveThemeCount: 0,
				errorMessage: translate( 'There was an error transferring your site. Please try again.' ),
			} );
			return;
		}

		const { requestActiveThemeCount } = this.state;
		this.setState( { requestActiveThemeCount: requestActiveThemeCount + 1 } );

		dispatchInitiateThemeTransfer( siteId, null, '', '', 'theme_install' );
	}

	continueToActivate() {
		const {
			siteId,
			theme,
			dispatchActivateTheme,
			dispatchAcceptAtomicTransferDialog,
			dispatchAcceptActivationModal,
		} = this.props;
		if ( siteId ) {
			dispatchAcceptAtomicTransferDialog( theme.id );
			dispatchAcceptActivationModal( theme.id );
			dispatchActivateTheme( theme.id, siteId );
		}
	}

	componentDidUpdate( prevProps: Readonly< AtomicTransferDialogProps > ): void {
		const { siteId, siteSlug, uploadError, isJetpack } = this.props;
		if (
			siteId &&
			siteSlug &&
			prevProps.isJetpack !== undefined &&
			prevProps.isJetpack !== isJetpack
		) {
			this.continueToActivate();
		}

		if (
			siteId &&
			uploadError &&
			prevProps.uploadError !== undefined &&
			prevProps.uploadError !== uploadError
		) {
			setTimeout( () => {
				this.initiateTransfer();
			}, 2000 );
		}
	}

	handleDismiss() {
		return this.props.dispatchDismissAtomicTransferDialog();
	}

	isLoading() {
		const { inProgress, activeTheme, theme, isJetpack } = this.props;
		const isThemeActive = activeTheme === theme?.id;

		const hasNotExceededMaxAttempts =
			this.state.requestActiveThemeCount > 0 && ! this.exceededMaxAttempts() && ! isJetpack;

		return inProgress || hasNotExceededMaxAttempts || ( isJetpack && ! isThemeActive );
	}

	renderActivationInProgress() {
		const activationText = translate( 'Please wait while we transfer your site.' );

		return (
			this.isLoading() && (
				<Notice
					className="themes__atomic-transfer-dialog-notice"
					status="is-info"
					showDismiss={ false }
					text={ activationText }
					icon="sync"
				/>
			)
		);
	}

	renderSuccessfulTransfer() {
		const { isJetpack } = this.props;
		const successfulTransferText = translate( 'Your site has been transferred successfully.' );

		return (
			isJetpack && (
				<Notice
					className="themes__atomic-transfer-dialog-notice"
					status="is-success"
					showDismiss={ false }
					text={ successfulTransferText }
					icon="checkmark"
				/>
			)
		);
	}

	renderError() {
		const { errorMessage } = this.state;

		return (
			errorMessage && (
				<Notice
					className="themes__atomic-transfer-dialog-notice"
					status="is-error"
					showDismiss={ false }
					text={ errorMessage }
					icon="notice"
				/>
			)
		);
	}

	render() {
		const { showEligibility, isMarketplaceProduct, inProgress } = this.props;

		return (
			<Dialog
				isVisible={ showEligibility }
				onClose={ () => this.handleDismiss() }
				shouldCloseOnEsc={ ! inProgress }
				showCloseIcon={ ! inProgress }
				shouldCloseOnOverlayClick={ ! inProgress }
			>
				{ this.renderActivationInProgress() }
				{ this.renderSuccessfulTransfer() }
				{ this.renderError() }

				<EligibilityWarnings
					disableContinueButton={ this.isLoading() }
					currentContext="plugin-details"
					isMarketplace={ isMarketplaceProduct }
					standaloneProceed
					onProceed={ () => this.handleAccept() }
					backUrl="#"
				/>
			</Dialog>
		);
	}
}

export default connect(
	( state: IAppState ) => {
		const siteId = getSelectedSiteId( state );
		const themeId = getThemeForAtomicTransferDialog( state );

		if ( ! siteId ) {
			return {};
		}

		return {
			siteId,
			theme: themeId && getCanonicalTheme( state, siteId, themeId ),
			showEligibility: shouldShowAtomicTransferDialog( state, themeId ),
			isMarketplaceProduct: isExternallyManagedTheme( state, themeId ),
			inProgress: isUploadInProgress( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
			activeTheme: getActiveTheme( state, siteId ),
			uploadError: typeof getUploadError( state, siteId ) === 'object',
			isJetpack: !! isJetpackSite( state, siteId ),
		};
	},
	{
		dispatchAcceptAtomicTransferDialog: acceptAtomicTransferDialog,
		dispatchDismissAtomicTransferDialog: dismissAtomicTransferDialog,
		dispatchAcceptActivationModal: acceptActivationModal,
		dispatchActivateTheme: activateTheme,
		dispatchInitiateThemeTransfer: initiateThemeTransfer,
	}
)( localize( AtomicTransferDialog ) );
