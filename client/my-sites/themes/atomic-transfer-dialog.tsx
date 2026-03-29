import { Modal } from '@wordpress/components';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import Notice from 'calypso/components/notice';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	acceptAtomicTransferDialog,
	dismissAtomicTransferDialog,
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
	transferStatus?: string | null;
	theme: Theme;
	siteSlug?: string | null;
	isMarketplaceProduct?: boolean;
	activeTheme?: string | null;
	uploadError?: boolean;
	isJetpack?: boolean;
	dispatchAcceptAtomicTransferDialog: typeof acceptAtomicTransferDialog;
	dispatchDismissAtomicTransferDialog: typeof dismissAtomicTransferDialog;
	dispatchActivateTheme: typeof activateTheme;
	dispatchInitiateThemeTransfer: typeof initiateThemeTransfer;
	dispatchRequestSite: typeof requestSite;
}

const SITE_POLL_INTERVAL_MS = 3000;
const SITE_POLL_TIMEOUT_MS = 30000;

type AtomicTransferDialogState = {
	requestActiveThemeCount: number;
	errorMessage: string | null;
};

class AtomicTransferDialog extends Component< AtomicTransferDialogProps > {
	state: AtomicTransferDialogState;

	maxRequestActiveThemeAttempts = 30;
	hasActivated = false;
	sitePollingInterval?: ReturnType< typeof setInterval >;
	sitePollingTimeout?: ReturnType< typeof setTimeout >;

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
		if ( this.hasActivated ) {
			return;
		}
		const { siteId, theme, dispatchActivateTheme, dispatchAcceptAtomicTransferDialog } = this.props;
		if ( siteId && theme?.id ) {
			this.hasActivated = true;
			dispatchAcceptAtomicTransferDialog( theme.id );
			dispatchActivateTheme( theme.id, siteId );
		}
	}

	startSitePolling( siteId: number ) {
		const { dispatchRequestSite } = this.props;

		this.sitePollingInterval = setInterval( () => {
			dispatchRequestSite( siteId );
		}, SITE_POLL_INTERVAL_MS );

		this.sitePollingTimeout = setTimeout( () => {
			this.stopSitePolling();
			this.setState( {
				errorMessage: translate(
					'Your site was transferred but is still updating. Please refresh and try again.'
				),
			} );
		}, SITE_POLL_TIMEOUT_MS );
	}

	stopSitePolling() {
		if ( this.sitePollingInterval ) {
			clearInterval( this.sitePollingInterval );
			this.sitePollingInterval = undefined;
		}
		if ( this.sitePollingTimeout ) {
			clearTimeout( this.sitePollingTimeout );
			this.sitePollingTimeout = undefined;
		}
	}

	componentWillUnmount() {
		this.stopSitePolling();
	}

	componentDidUpdate( prevProps: Readonly< AtomicTransferDialogProps > ): void {
		const { siteId, siteSlug, uploadError, isJetpack, transferStatus } = this.props;

		// After transfer completes, wait for the site to be recognized as Jetpack.
		// requestActiveThemeCount > 0 ensures we only act if we initiated a transfer in this session.
		if (
			siteId &&
			siteSlug &&
			transferStatus === transferStates.COMPLETE &&
			this.state.requestActiveThemeCount > 0
		) {
			if ( isJetpack ) {
				this.stopSitePolling();
				this.continueToActivate();
			} else if ( ! this.sitePollingInterval ) {
				this.startSitePolling( siteId );
			}
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

		const isActivatingAfterTransfer = isJetpack && theme?.id && ! isThemeActive;

		return inProgress || hasNotExceededMaxAttempts || isActivatingAfterTransfer;
	}

	renderActivationInProgress() {
		const { isJetpack } = this.props;
		const activationText = translate( 'Please wait while we transfer your site.' );

		return (
			this.isLoading() &&
			! isJetpack && (
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
		const { showEligibility, isMarketplaceProduct } = this.props;

		if ( ! showEligibility && ! this.isLoading() ) {
			return null;
		}

		return (
			<Modal
				className="plugin-details-cta__dialog-content"
				title={ translate( 'Before you continue' ) }
				onRequestClose={ this.isLoading() ? () => {} : () => this.handleDismiss() }
				isDismissible={ ! this.isLoading() }
				size="medium"
			>
				{ this.renderActivationInProgress() }
				{ this.renderSuccessfulTransfer() }
				{ this.renderError() }

				<EligibilityWarnings
					disableContinueButton={ !! this.isLoading() }
					currentContext="plugin-details"
					isMarketplace={ isMarketplaceProduct }
					standaloneProceed
					onDismiss={ this.isLoading() ? undefined : () => this.handleDismiss() }
					onProceed={ () => this.handleAccept() }
					backUrl="#"
				/>
			</Modal>
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
			transferStatus: getAutomatedTransferStatus( state, siteId ),
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
		dispatchActivateTheme: activateTheme,
		dispatchInitiateThemeTransfer: initiateThemeTransfer,
		dispatchRequestSite: requestSite,
	}
)( localize( AtomicTransferDialog ) );
