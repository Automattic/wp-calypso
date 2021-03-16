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
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import DomainMappingInstructions from 'calypso/my-sites/domains/components/mapping-instructions';

function isDataLoaded( domains, domain ) {
	return getSelectedDomain( { domains, selectedDomainName: domain } );
}

const DomainMappingDetails = ( {
	domain,
	domains,
	isSubdomainMapping,
	isRootDomainWithUs,
	siteId,
} ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	const purchasedDomain = getSelectedDomain( { domains, selectedDomainName: domain } );

	const mappingInstructions = (
		<DomainMappingInstructions
			aRecordsRequiredForMapping={ purchasedDomain?.aRecordsRequiredForMapping }
			areDomainDetailsLoaded={ isDataLoaded() }
			domainName={ purchasedDomain?.name }
		/>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<QuerySiteDomains siteId={ siteId } />
			<PurchaseDetail icon="cog" description={ mappingInstructions } isRequired />
		</div>
	);
};

const mapStateToProps = ( state, { domain } ) => {
	const selectedSite = getSelectedSite( state );
	return {
		domains: getDomainsBySiteId( state, selectedSite.ID ),
		isBusinessPlan: isBusiness( selectedSite.plan ),
		isSubdomainMapping: isSubdomain( domain ),
		selectedSiteDomain: selectedSite.domain,
		siteId: selectedSite.ID,
	};
};

export default connect( mapStateToProps )( localize( DomainMappingDetails ) );
