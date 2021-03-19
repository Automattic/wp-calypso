/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';
import { getSelectedDomain, isSubdomain } from 'calypso/lib/domains';
import { isBusiness } from 'calypso/lib/products-values';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import DomainMappingInstructions from 'calypso/my-sites/domains/components/mapping-instructions';

const DomainMappingDetails = ( {
	isSubdomainMapping,
	isRequestingDomainsDetails,
	isRootDomainWithUs,
	purchasedDomain,
	siteId,
} ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	const mappingInstructions = (
		<DomainMappingInstructions
			aRecordsRequiredForMapping={ purchasedDomain?.aRecordsRequiredForMapping }
			areDomainDetailsLoaded={ ! isRequestingDomainsDetails && !! purchasedDomain }
			domainName={ purchasedDomain?.name }
		/>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<QuerySiteDomains siteId={ siteId } />
			<PurchaseDetail icon="cog" body={ mappingInstructions } isRequired />
		</div>
	);
};

const mapStateToProps = ( state, { domain: selectedDomainName } ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite.ID );
	return {
		isBusinessPlan: isBusiness( selectedSite.plan ),
		isRequestingDomainsDetails: isRequestingSiteDomains( state, selectedSite.ID ),
		isSubdomainMapping: isSubdomain( selectedDomainName ),
		purchasedDomain: getSelectedDomain( { domains, selectedDomainName } ),
		selectedSiteDomain: selectedSite.domain,
		siteId: selectedSite.ID,
	};
};

export default connect( mapStateToProps )( localize( DomainMappingDetails ) );
