import { FoldableCard } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate, numberFormatCompact, formatCurrency, getCurrencyObject } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import WooLogoColor from 'calypso/assets/images/icons/Woo_logo_color.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import ReferralsFooter from '../footer';

import './style.scss';

// TODO: Remove this once we can use the new formatCurrency function that gives the compact number in the correct format.
const formatCurrencyCompact = ( amount: number, currencyCode = 'USD' ) => {
	const currencyObject = getCurrencyObject( amount, currencyCode );
	const formattedAmount =
		currencyObject.symbolPosition === 'before'
			? `${ currencyObject.symbol }${ numberFormatCompact( amount ) }`
			: `${ numberFormatCompact( amount ) }${ currencyObject.symbol }`;

	return formattedAmount;
};

export default function CommissionOverview() {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const title = isDesktop
		? translate( 'Your referrals and commissions - FAQ' )
		: translate( 'FAQ' );

	// TODO: This is a workaround to keep the formatting of the max amount consistent until
	// we can use the new formatCurrency function that gives the compact number in the correct format.
	const oneMillion = 1000000;
	const oneMillionFormatted = formatCurrencyCompact( oneMillion );

	return (
		<Layout
			className="commission-overview"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: isDesktop
									? translate( 'Your referrals and commissions' )
									: translate( 'Referrals' ),
								href: A4A_REFERRALS_LINK,
							},
							{
								label: translate( 'FAQ' ),
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
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
				<div className="commission-overview__section-container">
					<StepSection heading={ translate( 'How much can I earn?' ) }>
						<FoldableCard
							header={
								<>
									<div className="a4a-overview-hosting__logo-container">
										<img width={ 45 } src={ WooLogoColor } alt="WooCommerce" />
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
									" For example, if your client's store generates %(maxAmount)s in TPV per year, your revenue share for that year would be %(amount)s.",
								{
									args: {
										maxAmount: oneMillionFormatted,
										amount: formatCurrency( 500, 'USD', {
											stripZeros: true,
										} ),
									},
								}
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
										<img width={ 45 } src={ WooLogoColor } alt="WooCommerce" />
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
