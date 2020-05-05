/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompletePurchaseNotice from './guided-transfer-card/complete-purchase-notice';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { getExportingState } from 'state/exporter/selectors';
import { isGuidedTransferAwaitingPurchase } from 'state/sites/guided-transfer/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { States } from 'state/exporter/constants';

/**
 * Displays local notices for the Export tab of Site Settings
 */
class Notices extends Component {
	exportNotice() {
		const { exportDidComplete, exportDidFail, exportDownloadURL, translate } = this.props;

		if ( exportDidComplete ) {
			return (
				<Notice
					status="is-success"
					showDismiss={ false }
					text={ translate(
						'Your export was successful! ' + 'A download link has also been sent to your email.'
					) }
				>
					<NoticeAction href={ exportDownloadURL }>{ translate( 'Download' ) }</NoticeAction>
				</Notice>
			);
		}
		if ( exportDidFail ) {
			return (
				<Notice
					status="is-error"
					showDismiss={ false }
					text={ translate(
						'There was a problem preparing your ' +
							'export file. Please check your connection and try ' +
							'again, or contact support.'
					) }
				>
					<NoticeAction href={ CALYPSO_CONTACT }>{ translate( 'Get Help' ) }</NoticeAction>
				</Notice>
			);
		}

		return null;
	}

	render() {
		return (
			<div>
				{ this.exportNotice() }
				{ this.props.isGuidedTransferAwaitingPurchase && <CompletePurchaseNotice /> }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	exportDidComplete: getExportingState( state, getSelectedSiteId( state ) ) === States.COMPLETE,
	exportDidFail: getExportingState( state, getSelectedSiteId( state ) ) === States.FAILED,
	exportDownloadURL: state.exporter.downloadURL,
	isGuidedTransferAwaitingPurchase: isGuidedTransferAwaitingPurchase(
		state,
		getSelectedSiteId( state )
	),
} );

export default connect( mapStateToProps )( localize( Notices ) );
