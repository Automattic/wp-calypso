import QuerySitePlans from 'calypso/components/data/query-site-plans';
import DomainToPlanCreditMessage from 'calypso/components/domain-to-plan-credit-message';
import Notice from 'calypso/components/notice';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import type { PlanSlug } from '@automattic/calypso-products';
type Props = {
	className?: string;
	onDismissClick?: () => void;
	siteId: number;
	visiblePlans?: PlanSlug[];
};

const PlanNoticeDomainToPlanCredit = ( {
	className,
	onDismissClick,
	siteId,
	visiblePlans,
}: Props ) => {
	const domainToPlanCreditsApplicable = useDomainToPlanCreditsApplicable( siteId, visiblePlans );
	const showNotice = domainToPlanCreditsApplicable !== null && domainToPlanCreditsApplicable > 0;

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			{ showNotice && (
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					<DomainToPlanCreditMessage amount={ domainToPlanCreditsApplicable } />
				</Notice>
			) }
		</>
	);
};

export default PlanNoticeDomainToPlanCredit;
