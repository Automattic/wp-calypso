import PlanNoticeUpgradeCredit from 'calypso/my-sites/plans-features-main/components/plan-notice-upgrade-credit';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCreditNotice = () => {
	const site = useSelector( getSelectedSite );
	const { ID: siteId } = site || {};

	if ( ! siteId ) {
		return null;
	}

	return (
		<PlanNoticeUpgradeCredit
			className="hosting-overview__domain-to-plan-credit-notice"
			context="overview"
			siteId={ siteId }
		/>
	);
};

export default PlanCreditNotice;
