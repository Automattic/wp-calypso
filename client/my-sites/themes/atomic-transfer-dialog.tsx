import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import Notice from 'calypso/components/notice';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	acceptAtomicTransferDialog,
	dismissAtomicTransferDialog,
	activate as activateTheme,
	initiateThemeTransfer,
	requestActiveTheme,
} from 'calypso/state/themes/actions';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeForAtomicTransferDialog,
	isExternallyManagedTheme,
	shouldShowAtomicTransferDialog,
} from 'calypso/state/themes/selectors';
import {
	isTransferComplete,
	isUploadInProgress,
} from 'calypso/state/themes/upload-theme/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Theme } from 'calypso/types';
import './atomic-transfer-dialog.scss';

interface AtomicTransferDialogProps {
	siteId?: number;
	inProgress?: boolean;
	isTransferred?: boolean;
	showEligibility: boolean;
	theme: Theme;
	siteSlug?: string | null;
	isMarketplaceProduct?: boolean;
	activeTheme?: string | null;
	dispatchAcceptAtomicTransferDialog: typeof acceptAtomicTransferDialog;
	dispatchDismissAtomicTransferDialog: typeof dismissAtomicTransferDialog;
	dispatchActivateTheme: typeof activateTheme;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	dispatchInitiateThemeTransfer: typeof initiateThemeTransfer;
	dispatchRequestActiveTheme: typeof requestActiveTheme;
}

class AtomicTransferDialog extends Component< AtomicTransferDialogProps > {
	handleAccept() {
		const { siteId, dispatchInitiateThemeTransfer } = this.props;
		if ( ! siteId ) {
			return;
		}

		dispatchInitiateThemeTransfer( siteId, null, '' );
	}

	getAtomicSitePath = () => {
		const { origin, href } = window.location;

		return href.replace( origin, '' ).replace( /\b.wordpress.com/, '.wpcomstaging.com' );
	};

	updateActiveThemeStateAndRedirect = async ( siteId: number ) => {
		const { dispatchRequestActiveTheme, activeTheme, theme } = this.props;
		if ( activeTheme === theme?.id ) {
			return window.location.replace( this.getAtomicSitePath() );
		}
		try {
			await dispatchRequestActiveTheme( siteId );
		} catch ( e ) {
			/* do nothing */
		}

		setTimeout( () => {
			this.updateActiveThemeStateAndRedirect( siteId );
		}, 2000 );
	};

	componentDidUpdate( prevProps: Readonly< AtomicTransferDialogProps > ): void {
		const { siteId, siteSlug, isTransferred } = this.props;
		if ( siteId && siteSlug && prevProps.isTransferred !== isTransferred && isTransferred ) {
			this.updateActiveThemeStateAndRedirect( siteId );
		}
	}

	handleDismiss() {
		return this.props.dispatchDismissAtomicTransferDialog();
	}

	renderActivationInProgress() {
		const { inProgress, activeTheme, theme, isTransferred } = this.props;
		const isThemeActive = activeTheme === theme?.id;
		const activationText = translate( 'Please wait while we transfer your site.' );

		return (
			( inProgress || ( isTransferred && ! isThemeActive ) ) && (
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
		const { isTransferred, theme, activeTheme } = this.props;
		const isThemeActive = activeTheme === theme?.id;
		const successfulTransferText = translate( 'Your site has been transferred successfully.' );

		return (
			isTransferred &&
			isThemeActive && (
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

				<EligibilityWarnings
					disableContinueButton={ inProgress }
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
	( state ) => {
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
			isTransferred: isTransferComplete( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
			activeTheme: getActiveTheme( state, siteId ),
		};
	},
	{
		dispatchAcceptAtomicTransferDialog: acceptAtomicTransferDialog,
		dispatchDismissAtomicTransferDialog: dismissAtomicTransferDialog,
		dispatchActivateTheme: activateTheme,
		dispatchRecordTracksEvent: recordTracksEvent,
		dispatchInitiateThemeTransfer: initiateThemeTransfer,
		dispatchRequestActiveTheme: requestActiveTheme,
	}
)( localize( AtomicTransferDialog ) );
