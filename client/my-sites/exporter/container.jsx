import config from '@automattic/calypso-config';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteGuidedTransfer from 'calypso/components/data/query-site-guided-transfer';
import { isGuidedTransferInProgress } from 'calypso/state/sites/guided-transfer/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ExportCard from './export-card';
import ExportMediaCard from './export-media-card';
import GuidedTransferCard from './guided-transfer-card';
import InProgressCard from './guided-transfer-card/in-progress';
import Notices from './notices';

class ExporterContainer extends Component {
	render() {
		const { siteId, isJetpack, isTransferInProgress } = this.props;
		const showGuidedTransferOptions = config.isEnabled( 'manage/export/guided-transfer' );

		return (
			<div className="exporter">
				{ showGuidedTransferOptions && <QuerySiteGuidedTransfer siteId={ siteId } /> }

				<Notices />
				{ showGuidedTransferOptions && isTransferInProgress && <InProgressCard /> }
				<ExportCard siteId={ siteId } />
				{ ! isJetpack && <ExportMediaCard siteId={ siteId } /> }
				{ showGuidedTransferOptions && ! isTransferInProgress && <GuidedTransferCard /> }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	siteId: getSelectedSiteId( state ),
	isJetpack: isJetpackSite( state, siteId ),
	isTransferInProgress: isGuidedTransferInProgress( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( ExporterContainer );
