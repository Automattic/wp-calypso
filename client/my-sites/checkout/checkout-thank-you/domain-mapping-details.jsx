import { isBusiness } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { getSelectedDomain, isSubdomain } from 'calypso/lib/domains';
import { getWpcomDomain } from 'calypso/lib/domains/get-wpcom-domain';
import DomainMappingInstructions from 'calypso/my-sites/domains/components/mapping-instructions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const DomainMappingDetails = ( {
	isAtomicSite,
	isSubdomainMapping,
	isRequestingDomainsDetails,
	isRootDomainWithUs,
	purchasedDomain,
	siteId,
	wpcomDomain,
} ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	const mappingInstructions = (
		<DomainMappingInstructions
			aRecordsRequiredForMapping={ purchasedDomain?.aRecordsRequiredForMapping }
			areDomainDetailsLoaded={ ! isRequestingDomainsDetails && !! purchasedDomain }
			domainName={ purchasedDomain?.name }
			isAtomic={ isAtomicSite }
			subdomainPart={ purchasedDomain?.subdomainPart }
			wpcomDomainName={ wpcomDomain?.domain }
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
		isAtomicSite: selectedSite.options?.is_automated_transfer,
		isBusinessPlan: isBusiness( selectedSite.plan ),
		isRequestingDomainsDetails: isRequestingSiteDomains( state, selectedSite.ID ),
		isSubdomainMapping: isSubdomain( selectedDomainName ),
		purchasedDomain: getSelectedDomain( { domains, selectedDomainName } ),
		selectedSiteDomain: selectedSite.domain,
		siteId: selectedSite.ID,
		wpcomDomain: getWpcomDomain( domains ),
	};
};

export default connect( mapStateToProps )( localize( DomainMappingDetails ) );
