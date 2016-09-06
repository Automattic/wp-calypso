/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import QuerySiteGuidedTransfer from 'components/data/query-site-guided-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isGuidedTransferInProgress } from 'state/sites/guided-transfer/selectors';

import Notices from './notices';
import ExportCard from './export-card';
import GuidedTransferCard from './guided-transfer-card';
import InProgressCard from './guided-transfer-card/in-progress';

class Exporter extends Component {
	render() {
		const {
			siteId,
			isTransferInProgress,
		} = this.props;
		const showGuidedTransferOptions = config.isEnabled( 'manage/export/guided-transfer' );

		return (
			<div className="exporter">
				{ showGuidedTransferOptions && <QuerySiteGuidedTransfer siteId={ siteId } /> }

				<Notices />
				{ showGuidedTransferOptions && isTransferInProgress &&
					<InProgressCard /> }
				<ExportCard siteId={ siteId } />
				{ showGuidedTransferOptions && ! isTransferInProgress &&
					<GuidedTransferCard /> }
			</div>
		);
	}
}

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
	isTransferInProgress: isGuidedTransferInProgress( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( Exporter );
