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
import Button from 'components/button';
import Card from 'components/card';
import Placeholder from 'my-sites/site-settings/placeholder';
import QuerySitePlans from 'components/data/query-site-plans';
import { getCurrentPlanPurchaseId } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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
		<Card className="disconnect-site__question">
			<QuerySitePlans siteId={ siteId } />
			<p>{ translate( 'Would you like to downgrade your plan?' ) }</p>
			<div>
				<Button compact href={ `/me/purchases/${ siteSlug }/${ planPurchaseId }` }>
					Yes
				</Button>
				<Button compact href={ confirmHref }>
					No
				</Button>
			</div>
		</Card>
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
