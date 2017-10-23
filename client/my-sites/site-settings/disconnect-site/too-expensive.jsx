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
import CompactCard from 'components/card/compact';
import Placeholder from 'my-sites/site-settings/placeholder';
import QuerySitePlans from 'components/data/query-site-plans';
import { getCurrentPlanPurchaseId } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { addQueryArgs } from 'lib/url';

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
