import styled from '@emotion/styled';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { isNotAtomicJetpack, isTrialSite } from '../utils';
import { PlanRenewNag } from './sites-plan-renew-nag';
import type { SiteExcerptData } from '@automattic/sites';

const SitePlanContainer = styled.div`
	display: inline;
	overflow: hidden;
	> * {
		vertical-align: middle;
		line-height: normal;
	}
`;

const SitePlanIcon = styled.div`
	display: inline-block;
	margin-inline-end: 6px;
`;

const PlanRenewNagContainer = styled.div`
	line-height: 20px;
`;

interface SitePlanProps {
	site: SiteExcerptData;
	userId: number | null;
}

const STAGING_PLAN_LABEL = 'Staging';

export const SitePlan = ( { site, userId }: SitePlanProps ) => {
	const isWpcomStagingSite = site?.is_wpcom_staging_site ?? false;
	const trialSite = isTrialSite( site );

	return (
		<SitePlanContainer>
			{ ! isWpcomStagingSite ? (
				<>
					{ isNotAtomicJetpack( site ) && ! site.plan?.expired && (
						<SitePlanIcon>
							<JetpackLogo size={ 16 } />
						</SitePlanIcon>
					) }
					{ site.plan?.expired ? (
						<PlanRenewNagContainer>
							<PlanRenewNag
								plan={ site.plan }
								isSiteOwner={ site?.site_owner === userId }
								checkoutUrl={
									trialSite
										? `/plans/${ site.slug }`
										: `/checkout/${ site.slug }/${ site.plan?.product_slug }`
								}
								isUpgradeable={ trialSite }
							/>
						</PlanRenewNagContainer>
					) : (
						site.plan?.product_name_short
					) }
				</>
			) : (
				STAGING_PLAN_LABEL
			) }
		</SitePlanContainer>
	);
};
