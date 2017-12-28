/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GuidedTransfer from './guided-transfer';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getSiteSlug } from 'client/state/sites/selectors';
import { isEligibleForGuidedTransfer } from 'client/state/sites/guided-transfer/selectors';

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isEligibleForGuidedTransfer: isEligibleForGuidedTransfer( state, siteId ),
	};
}

export default connect( mapStateToProps )( GuidedTransfer );
