import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { isNotAtomicJetpack } from '../utils';
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

export const SitePlan = ( { site, userId }: SitePlanProps ) => {
	const planLabel = useSelector( ( state ) => {
		if ( site?.options?.wpcom_production_blog_id ) {
			return (
				getSitePlan( state, site?.options?.wpcom_production_blog_id )?.product_name_short ?? ''
			);
		}
		return site.plan?.product_name_short ?? '';
	} );

	return (
		<SitePlanContainer>
			{ isNotAtomicJetpack( site ) && ! site.plan?.expired && (
				<SitePlanIcon>
					<JetpackLogo size={ 16 } />
				</SitePlanIcon>
			) }
			{ site.plan?.expired && ! site?.options?.wpcom_production_blog_id ? (
				<PlanRenewNagContainer>
					<PlanRenewNag
						plan={ site.plan }
						isSiteOwner={ site?.site_owner === userId }
						checkoutUrl={ `/checkout/${ site.slug }/${ site.plan?.product_slug }` }
					/>
				</PlanRenewNagContainer>
			) : (
				planLabel
			) }
		</SitePlanContainer>
	);
};
