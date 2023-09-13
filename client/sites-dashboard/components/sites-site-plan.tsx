import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { isNotAtomicJetpack, isMigrationTrialSite } from '../utils';
import { PlanRenewNag } from './sites-plan-renew-nag';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const SitePlanContainer = styled.div`
	display: inline;
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
	const isECommerceTrialSite = site.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const isMigrationTrialPlanSite = isMigrationTrialSite( site );

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
								checkoutUrl={ `/checkout/${ site.slug }/${ site.plan?.product_slug }` }
								hideRenewLink={ isECommerceTrialSite || isMigrationTrialPlanSite }
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
