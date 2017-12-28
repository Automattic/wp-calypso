/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';
import Placeholder from 'client/my-sites/site-settings/placeholder';
import QuerySitePlans from 'client/components/data/query-site-plans';
import { getCurrentPlanPurchaseId } from 'client/state/selectors';
import { getSiteSlug } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { addQueryArgs } from 'client/lib/url';

const TooExpensive = ( { confirmHref, planPurchaseId, siteId, siteSlug, translate } ) => {
	if ( ! siteSlug || ! planPurchaseId ) {
		return (
			<div>
				<QuerySitePlans siteId={ siteId } />
				<Placeholder />
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
