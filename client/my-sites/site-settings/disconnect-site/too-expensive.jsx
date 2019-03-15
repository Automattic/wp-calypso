/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import getCurrentPlanPurchaseId from 'state/selectors/get-current-plan-purchase-id';
import QuerySitePlans from 'components/data/query-site-plans';
import { addQueryArgs } from 'lib/url';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const TooExpensive = ( { confirmHref, planPurchaseId, siteId, siteSlug, translate } ) => {
	if ( ! planPurchaseId ) {
		return (
			<div>
				<QuerySitePlans siteId={ siteId } />
			</div>
		);
	}
	return (
		<div>
			<QuerySitePlans siteId={ siteId } />
			<CompactCard href={ `/me/purchases/${ siteSlug }/${ planPurchaseId }` }>
				{ translate( 'Manage your purchases' ) }
			</CompactCard>
			<CompactCard href={ addQueryArgs( { reason: 'too-expensive' }, confirmHref ) }>
				{ translate( 'Proceed to disconnect' ) }
			</CompactCard>
		</div>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		planPurchaseId: getCurrentPlanPurchaseId( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( TooExpensive ) );
