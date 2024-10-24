import { Card, Badge } from '@automattic/components';
import { Icon, check } from '@wordpress/icons';
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
import DownloadBadges from '../../download-badges';
import getAgencyTierInfo from '../../lib/get-agency-tier-info';
import getTierBenefits from '../../lib/get-tier-benefits';
import { AgencyTier } from '../../types';

import './style.scss';

export default function AgencyTierOverview() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const title = translate( 'Your Agency Tier' );
	const benefits = getTierBenefits( translate );

	const currentAgencyTier = agency?.tier?.id;
	const currentAgencyTierInfo = currentAgencyTier
		? getAgencyTierInfo( currentAgencyTier, translate )
		: null;

	const learnMoreLink =
		'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits/';

	const ALL_TIERS: AgencyTier[] = [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ];

	// Show download badges button for Agency Partner and Pro Agency Partner tiers
	const showDownloadBadges =
		currentAgencyTier && [ 'agency-partner', 'pro-agency-partner' ].includes( currentAgencyTier );

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
						{ showDownloadBadges && <DownloadBadges /> }
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
						<div className="agency-tier-overview__top-content-right">
							<Card className="agency-tier-overview__benefit-card" compact>
								<div className="agency-tier-overview__benefit-card-title">
									{ translate( 'Level up with Automattic!' ) }
								</div>
								<div className="agency-tier-overview__benefit-card-items">
									{ ALL_TIERS.map( ( tier ) => {
										const { title, logo, id } = getAgencyTierInfo( tier, translate );
										const currentTierInfo = getAgencyTierInfo(
											currentAgencyTierInfo.id,
											translate
										);
										const isCurrentTier = currentTierInfo.includedTiers.includes( tier );
										return (
											<div
												key={ tier }
												className={ clsx( 'agency-tier-overview__benefit-card-item', {
													'is-opacity-50': ! isCurrentTier,
												} ) }
											>
												<div className="agency-tier-overview__benefit-card-item-icon">
													<img src={ logo } alt={ tier } />
													{ isCurrentTier && (
														<span
															className={ clsx(
																'agency-tier-overview__benefit-card-item-icon-check',
																id
															) }
														>
															<span>
																<Icon icon={ check } size={ 24 } />
															</span>
														</span>
													) }
												</div>
												<span className="agency-tier-overview__benefit-card-item-title">
													{ title }
												</span>
											</div>
										);
									} ) }
								</div>
							</Card>
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
