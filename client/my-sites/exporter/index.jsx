/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';

import Notices from './notices';
import ExportCard from './export-card';
import GuidedTransferCard from './guided-transfer-card';
import InProgressCard from './guided-transfer-card/in-progress';

class Exporter extends Component {
	render() {
		const {
			siteId,
			isGuidedTransferInProgress,
		} = this.props;
		const showGuidedTransferOptions = config.isEnabled( 'manage/export/guided-transfer' );

		return <div className="exporter">
			<Notices />
			{ showGuidedTransferOptions && isGuidedTransferInProgress &&
				<InProgressCard /> }
			<ExportCard siteId={ siteId } />
			{ showGuidedTransferOptions && ! isGuidedTransferInProgress &&
				<GuidedTransferCard /> }
		</div>;
	}
}

function mapStateToProps( state ) {
	return {
		siteId: getSelectedSiteId( state ),

		// This will be replaced with a Redux selector once we've built out
		// the reducers
		isGuidedTransferInProgress: false,
	};
}

export default connect( mapStateToProps )( Exporter );
