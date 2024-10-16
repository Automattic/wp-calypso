import { Card, Badge } from '@automattic/components';
import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getAgencyTierInfo from '../../lib/get-agency-tier-info';
import getTierBenefits from '../../lib/get-tier-benefits';

import './style.scss';

export default function AgencyTierOverview() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const title = translate( 'Your Agency Tier' );
	const benefits = getTierBenefits( translate );

	const currentAgencyTierInfo = agency?.tier?.id
		? getAgencyTierInfo( agency.tier.id, translate )
		: null;

	const learnMoreLink = ''; // TODO: Add link

	return (
		<Layout className="agency-tier-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>
						{ translate( 'Experience the rewards of selling Automattic products and hosting.' ) }
					</Subtitle>
					<Actions>
						<MobileSidebarNavigation />
						{
							// TODO: Add actions
							<></>
						}
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ currentAgencyTierInfo && (
					<div className="agency-tier-overview__top-content">
						<div className="agency-tier-overview__top-content-left">
							<div className="agency-tier-overview__current-tier-container">
								<div
									className={ clsx(
										'agency-tier-overview__current-tier-badge',
										currentAgencyTierInfo.id
									) }
								>
									<div className="agency-tier-overview__current-agency-tier">
										{ currentAgencyTierInfo.fullTitle }
									</div>
								</div>
								<div className="agency-tier-overview__current-tier-aside">
									<div>{ currentAgencyTierInfo.subtitle }</div>
									{ translate( '{{a}}Learn more{{/a}} ↗', {
										components: {
											a: <a target="_blank" href={ learnMoreLink } rel="noopener noreferrer" />,
										},
									} ) }
								</div>
							</div>
						</div>
					</div>
				) }
				<div className="agency-tier-overview__bottom-content">
					<div className="agency-tier-overview__bottom-content-subheading">
						{ translate( 'Take a closer look' ) }
					</div>
					<div className="agency-tier-overview__bottom-content-heading">
						{ translate( 'Explore the benefits of the tiers' ) }
					</div>
					<div className="agency-tier-overview__bottom-content-cards">
						{ benefits.map( ( benefit ) => (
							<Card key={ benefit.title } className="agency-tier-overview__benefit-card" compact>
								<div className="agency-tier-overview__benefit-card-content">
									<div className="agency-tier-overview__benefit-card-header">
										<div className="agency-tier-overview__benefit-card-icons">
											{ benefit.availableTiers.map( ( tier ) => {
												const { logo } = getAgencyTierInfo( tier, translate );
												return (
													<img
														key={ tier }
														src={ logo }
														alt={ tier }
														className="agency-tier-overview__benefit-card-icon"
													/>
												);
											} ) }
										</div>

										{ benefit.isComingSoon && (
											<div className="agency-tier-overview__benefit-card-coming-soon">
												<Badge type="info">{ translate( 'Coming Soon' ) }</Badge>
											</div>
										) }
									</div>
									<div>
										<div className="agency-tier-overview__benefit-card-title">
											{ benefit.title }
										</div>
										<div className="agency-tier-overview__benefit-card-desciption">
											{ benefit.description }
										</div>
									</div>

									{ benefit.features.length > 0 && (
										<ul className="agency-tier-overview__benefit-card-features">
											{ benefit.features.map( ( feature ) => (
												<li key={ feature }>{ feature }</li>
											) ) }
										</ul>
									) }
								</div>
							</Card>
						) ) }
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
