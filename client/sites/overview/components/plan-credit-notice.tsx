import { useSitePlans } from '@automattic/data-stores/src/plans';
import { Notice } from '@wordpress/components';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import DomainToPlanCreditMessage from 'calypso/components/domain-to-plan-credit-message';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

const PlanCreditNotice = () => {
	const site = useSelector( getSelectedSite );
	const { ID: siteId } = site || {};
	const { data: sitePlans } = useSitePlans( { siteId, coupon: undefined } );
	const domainToPlanCreditsApplicable = useDomainToPlanCreditsApplicable(
		siteId,
		Object.keys( sitePlans || {} ) as PlanSlug[]
	);
	const showNotice = domainToPlanCreditsApplicable !== null && domainToPlanCreditsApplicable > 0;

	if ( ! siteId ) {
		return null;
	}

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			{ showNotice && (
				<Notice
					className="hosting-overview__domain-to-plan-credit-notice"
					isDismissible={ false }
					status="info"
					onRemove={ () => {} }
				>
					<DomainToPlanCreditMessage amount={ domainToPlanCreditsApplicable } />
				</Notice>
			) }
		</>
	);
};

export default PlanCreditNotice;
