import { Card, Badge } from '@automattic/components';
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
import getAgencyTierLogo from '../../lib/get-agency-tier-logo';
import getTierBenefits from '../../lib/get-tier-benefits';

import './style.scss';

export default function AgencyTierOverview() {
	const translate = useTranslate();

	const title = translate( 'Your Agency Tier' );
	const benefits = getTierBenefits( translate );

	return (
		<Layout
			className="agency-tier-overview"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>
						{ translate( 'Experience the rewards of selling Automattic products and hosting.' ) }
					</Subtitle>
					<Actions>
						{
							// TODO: Add actions
							<></>
						}
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
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
											{ benefit.availableTiers.map( ( tier ) => (
												<img
													key={ tier }
													src={ getAgencyTierLogo( tier ) }
													alt={ tier }
													className="agency-tier-overview__benefit-card-icon"
												/>
											) ) }
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
