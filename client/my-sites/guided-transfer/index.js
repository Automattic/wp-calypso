import { connect } from 'react-redux';
import { isEligibleForGuidedTransfer } from 'calypso/state/sites/guided-transfer/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import GuidedTransfer from './guided-transfer';

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isEligibleForGuidedTransfer: isEligibleForGuidedTransfer( state, siteId ),
	};
}

export default connect( mapStateToProps )( GuidedTransfer );
