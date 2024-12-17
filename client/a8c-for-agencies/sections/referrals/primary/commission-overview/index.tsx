import { FoldableCard } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import ReferralsFooter from '../footer';

import './style.scss';

export default function CommissionOverview( {
	isAutomatedReferral,
}: {
	isAutomatedReferral?: boolean;
} ) {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const automatedReferralTitle = isDesktop
		? translate( 'Your referrals and commissions - FAQ' )
		: translate( 'FAQ' );

	const title = isAutomatedReferral
		? automatedReferralTitle
		: translate( 'Referrals - Commission details and terms' );

	return (
		<Layout
			className={ clsx( 'commission-overview', {
				'commission-overview__layout-automated': isAutomatedReferral,
			} ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label:
									isAutomatedReferral && isDesktop
										? translate( 'Your referrals and commissions' )
										: translate( 'Referrals' ),
								href: A4A_REFERRALS_LINK,
							},
							{
								label: isAutomatedReferral
									? translate( 'FAQ' )
									: translate( 'Commission details and terms' ),
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ isAutomatedReferral && (
					<>
						<div className="commission-overview__section-heading">
							{ translate( 'Referrals and commissions Frequently Asked Questions{{nbsp/}}(FAQ)', {
								components: {
									nbsp: <>&nbsp;</>,
								},
							} ) }
						</div>
						<div className="commission-overview__section-subtitle">
							{ translate(
								'A list of frequently asked questions and answers related to referrals and commissions.'
							) }
						</div>
					</>
				) }
				<div className="commission-overview__section-container">
					<StepSection heading={ translate( 'How much can I earn?' ) }>
						<FoldableCard
							header={
								<>
									<div className="a4a-overview-hosting__logo-container">
										<WooCommerceLogo className="woocommerce-logo" size={ 40 } />
									</div>
									<div>{ translate( 'WooPayments revenue share' ) }</div>
								</>
							}
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'You will receive a revenue share of 5 basis points (bps) on new WooPayments total payments volume (“TPV”) on client sites through June 30, 2025.' +
									' For example, if your client’s store generates $1M in TPV per year, your revenue share for that year would be $500.'
							) }
						</FoldableCard>

						<FoldableCard
							header={
								<>
									<div className="a4a-overview-hosting__logo-container">
										<img className="pressable-icon" src={ pressableIcon } alt="Pressable" />
										<WordPressLogo className="a4a-overview-hosting__wp-logo" size={ 24 } />
									</div>

									<div>
										{ translate( 'Hosting revenue share (WordPress.com and{{nbsp/}}Pressable)', {
											components: {
												nbsp: <>&nbsp;</>,
											},
										} ) }
									</div>
								</>
							}
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'Get a 20% revenue share when you refer your clients to WordPress.com and Pressable until June 30th, 2025 (and renewals on those subscriptions).'
							) }
						</FoldableCard>

						<FoldableCard
							header={
								<>
									<div className="a4a-overview-hosting__logo-container">
										<JetpackLogo className="jetpack-logo" size={ 24 } />
										<WooCommerceLogo className="woocommerce-logo" size={ 40 } />
									</div>

									<div>
										{ translate( 'Jetpack products and Woo{{8209/}}owned{{nbsp/}}extensions', {
											components: {
												nbsp: <>&nbsp;</>,
												8209: <>&#8209;</>,
											},
										} ) }
									</div>
								</>
							}
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'Get a 50% revenue share on Jetpack products and Woo-owned extensions until June 30th, 2025 (and renewals on those subscriptions).'
							) }
						</FoldableCard>
					</StepSection>

					<StepSection heading={ translate( 'Eligibility requirements and terms of use?' ) }>
						<FoldableCard
							header={ translate( 'Active referrals' ) }
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'To continue earning a revenue share on all of the above, you must refer at least one new client to a WordPress.com or Pressable plan each year, starting from the date that you joined the Automattic for Agencies program.'
							) }
						</FoldableCard>

						<FoldableCard
							header={ translate( 'Automattic Affiliate Program' ) }
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'If you are also a member of the Automattic Affiliate Program, you will not be paid out again on any transactions that you have already received commission on.'
							) }
						</FoldableCard>
					</StepSection>
				</div>

				<ReferralsFooter />
			</LayoutBody>
		</Layout>
	);
}
