/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GuidedTransfer from './guided-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	return {
		siteSlug,
	};
}

export default connect( mapStateToProps )( GuidedTransfer );
