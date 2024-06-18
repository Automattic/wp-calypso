import { FoldableCard } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import StepSection from '../../common/step-section';
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
								<div className="commission-overview__heading">
									<WooCommerceLogo className="woocommerce-logo" size={ 40 } />
									{ translate( 'Woo Payments revenue share' ) }
								</div>
							}
							expanded
							clickableHeader
							summary={ false }
						>
							{ translate(
								'You will receive a revenue share of 5 basis points (0.05%) on new WooPayments gross merchandise value (“GMV”) on client sites through June 30, 2025.' +
									' For example, if your client’s store generates $1M in GMV per year, your revenue share for that year would be $500.'
							) }
						</FoldableCard>

						<FoldableCard
							header={
								<div className="commission-overview__heading">
									<img src={ pressableIcon } alt="Pressable" />
									<WordPressLogo className="a4a-overview-hosting__wp-logo" size={ 24 } />
									{ translate( 'Hosting revenue share (WordPress.com and Pressable)' ) }
								</div>
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
								<div className="commission-overview__heading">
									<JetpackLogo className="jetpack-logo" size={ 24 } />
									<WooCommerceLogo className="woocommerce-logo" size={ 40 } />
									{ translate( 'Jetpack products and Woo-owned extensions' ) }
								</div>
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
