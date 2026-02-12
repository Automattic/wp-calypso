import { useTranslate } from 'i18n-calypso';
import getAgencyTierInfo from 'calypso/a8c-for-agencies/sections/agency-tier/lib/get-agency-tier-info';
import AgencyTierProgressCard from 'calypso/a8c-for-agencies/sections/agency-tier/progress-card';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

import './style.scss';

export default function OverviewSidebarAgencyTier() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const currentAgencyTierId = agency?.tier?.id;
	const influencedRevenue = agency?.influenced_revenue;
	const tierStatus = agency?.tier?.status ?? undefined;
	const currentAgencyTierInfo = getAgencyTierInfo( currentAgencyTierId, translate );

	if ( ! currentAgencyTierInfo ) {
		return null;
	}

	return (
		<AgencyTierProgressCard
			currentAgencyTierId={ currentAgencyTierId }
			influencedRevenue={ influencedRevenue ?? 0 }
			tierStatus={ tierStatus }
		/>
	);
}
