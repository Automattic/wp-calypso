import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import OverviewSidebarGrowthAcceleratorCta from 'calypso/a8c-for-agencies/sections/overview/sidebar/growth-accelerator/cta';
import OnboardingTourBannerAgencyTiers from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-agency-tiers.svg';
import OnboardingTourBannerGrowthCall from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-growth-call.svg';
import OnboardingTourBannerMarketplace from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-marketplace.svg';
import OnboardingTourBannerMigrations from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-migrations.svg';
import OnboardingTourBannerPurchases from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-purchases.svg';
import OnboardingTourBannerReferrals from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-referrals.svg';
import OnboardingTourBannerSites from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-sites.svg';
import OnboardingTourBannerTeam from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-team.svg';
import OnboardingTourBannerWelcome from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-welcome.svg';
import OnboardingTourBannerWooPayments from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-woopayments.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	A4A_MARKETPLACE_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_OVERVIEW_LINK,
	A4A_PURCHASES_LINK,
	A4A_REFERRALS_LINK,
	A4A_SITES_LINK,
	A4A_AGENCY_TIER_LINK,
	A4A_WOOPAYMENTS_LINK,
	A4A_TEAM_LINK,
} from '../../../sidebar-menu/lib/constants';

export default function useOnboardingTourSections() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useMemo(
		() => [
			{
				id: 'onboarding-tour-welcome',
				title: translate( 'Welcome' ),
				bannerImage: OnboardingTourBannerWelcome,
				isDarkBanner: true,
				content: {
					title: translate( 'Welcome to Automattic for Agencies!' ),
					descriptions: [
						translate(
							"We're more than a site management platform—we're your partner in growing your WordPress agency. This quick tour highlights key features and benefits to help you boost revenue and streamline your workflows."
						),
					],
					hint: translate(
						"{{b}}Spoiler alert:{{/b}} You can unlock serious earning potential, deliver better client results, and boost your agency's efficiency. Stick with the tour to see how, or jump in and explore—your progress is saved and you can pick it back up any time.",
						{
							components: {
								b: <b />,
							},
						}
					),
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_OVERVIEW_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_overview_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'Check out the Overview page' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_start_tour_click' ) );
									onNext();
								} }
							>
								{ translate( 'Start tour' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-sites',
				title: translate( 'Sites' ),
				bannerImage: OnboardingTourBannerSites,
				content: {
					title: translate( 'One dashboard. Every site. Seamless management.' ),
					descriptions: [
						translate(
							"Monitor, manage, and optimize all your client sites—regardless of where they're hosted—right from the Automattic for Agencies dashboard."
						),
						translate(
							'The lightweight plugin connects your sites in seconds. From there, use built-in Jetpack tools to track performance, boost speed, and keep things secure and backed up.'
						),
					],
					hint: translate(
						'{{b}}Pro tip:{{/b}} Sites hosted on Pressable come with Jetpack Complete (a $800+ value per site, annually) at no extra cost.',
						{
							components: {
								b: <b />,
							},
						}
					),
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_SITES_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_sites_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'Connect your first site' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-marketplace',
				title: translate( 'Marketplace' ),
				bannerImage: OnboardingTourBannerMarketplace,
				isDarkBanner: true,
				content: {
					title: translate( 'Buy at a discount or earn commission—your choice!' ),
					descriptions: [
						translate(
							'You now have the freedom to choose how you work with clients. Purchase products and hosting directly and enjoy volume discounts, or switch to referral mode and let clients pay while you earn up to 50% commission on products without the billing headaches.'
						),
						translate( 'Did we mention this is a recurring commission?' ),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_MARKETPLACE_LINK );
									dispatch(
										recordTracksEvent(
											'calypso_a4a_onboarding_tour_explore_marketplace_page_click'
										)
									);
									onClose();
								} }
							>
								{ translate( 'Explore products & hosting' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-purchases',
				title: translate( 'Purchases' ),
				bannerImage: OnboardingTourBannerPurchases,
				isDarkBanner: true,
				content: {
					title: translate( 'Easily manage all your purchases in one spot.' ),
					descriptions: [
						translate(
							'Assign Jetpack products and Woo extensions, launch WordPress.com sites, manage Pressable hosting, and access all your billing and invoices—no digging required.'
						),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_PURCHASES_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_purchases_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'View purchases' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-referrals',
				title: translate( 'Referrals' ),
				bannerImage: OnboardingTourBannerReferrals,
				content: {
					title: translate( 'Track referrals and commissions with ease' ),
					descriptions: [
						translate(
							"Send referrals through the marketplace, then head to your referrals dashboard to view total commissions, upcoming payouts, and the status of your clients' products and hosting."
						),
						translate(
							'Have questions about commission rates and eligibility? Check the FAQ right in the Referrals dashboard.'
						),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_REFERRALS_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_referrals_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'View Referrals Dashboard' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-migrations',
				title: translate( 'Migrations' ),
				bannerImage: OnboardingTourBannerMigrations,
				content: {
					title: translate( 'Better hosting for your clients. Up to $10K for you.' ),
					descriptions: [
						translate(
							'Tired of subpar hosting? Migrate your sites to WordPress.com or Pressable and tap into WP Cloud—the only cloud platform built just for WordPress.'
						),
						translate(
							'We offer 5 free development licenses on WordPress.com (only pay when you launch) and a free Pressable demo. See the difference for yourself.'
						),
					],
					hint: translate(
						'{{b}}Limited time offer:{{/b}} Migrate your sites to Pressable or WordPress.com and earn up to $10,000*',
						{
							components: {
								b: <b />,
							},
						}
					),
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_MIGRATIONS_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_migrations_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'View migration offer' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-woopayments',
				title: translate( 'WooPayments' ),
				bannerImage: OnboardingTourBannerWooPayments,
				isDarkBanner: true,
				content: {
					title: translate( 'Learn. Pitch. Earn.' ),
					descriptions: [
						translate(
							"If you build sites using WooCommerce, you're leaving money on the table by not using WooPayments, Woo's fully-integrated payments solution. "
						),
						translate(
							"We've made it easy for you to learn about WooPayments, copy and paste a pitch to send to your clients, and track your earnings from your referrals all in one place."
						),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_WOOPAYMENTS_LINK );
									dispatch(
										recordTracksEvent(
											'calypso_a4a_onboarding_tour_explore_woopayments_page_click'
										)
									);
									onClose();
								} }
							>
								{ translate( 'Check out WooPayments' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-agency-tiers',
				title: translate( 'Agency Tiers' ),
				bannerImage: OnboardingTourBannerAgencyTiers,
				content: {
					title: translate( 'Resources and rewards tailored for your growth' ),
					descriptions: [
						translate(
							'Our Agency Tiers program unlocks exclusive perks—like co-marketing, directory placement, pre-qualified leads, and dedicated partner managers. More tools, more visibility, more ways to earn.'
						),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_AGENCY_TIER_LINK );
									dispatch(
										recordTracksEvent(
											'calypso_a4a_onboarding_tour_explore_agency_tiers_page_click'
										)
									);
									onClose();
								} }
							>
								{ translate( 'Check out WooPayments' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-team',
				title: translate( 'Team' ),
				bannerImage: OnboardingTourBannerTeam,
				content: {
					title: translate( 'Invite your team. Reclaim your time.' ),
					descriptions: [
						translate(
							'Running a growing agency is a team sport. With our dashboard, you can bring your whole crew along to help manage sites, send referrals, and keep clients happy.'
						),
					],
				},
				renderActions: ( { onNext, onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									page( A4A_TEAM_LINK );
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_team_page_click' )
									);
									onClose();
								} }
							>
								{ translate( 'Add your team' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click' ) );
									onNext();
								} }
							>
								{ translate( 'Next benefit' ) }
							</Button>
						</>
					);
				},
			},
			{
				id: 'onboarding-tour-growth-call',
				title: translate( 'Free growth call' ),
				bannerImage: OnboardingTourBannerGrowthCall,
				isDarkBanner: true,
				content: {
					title: translate( 'Free agency growth call' ),
					descriptions: [
						translate(
							"Set up time with one of our growth specialists to think more strategically about your agency's success. Together, we'll explore your goals, identify new opportunities, and share proven ways to attract and retain more clients. Reach out anytime — we're here to support you."
						),
					],
				},
				renderActions: ( { onClose }: { onNext: () => void; onClose: () => void } ) => {
					return (
						<>
							<Button
								variant="secondary"
								onClick={ () => {
									dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_end_tour_click' ) );
									onClose();
								} }
							>
								{ translate( 'End tour' ) }
							</Button>
							<OverviewSidebarGrowthAcceleratorCta
								className="a4a-onboarding-tour__schedule-a-call-cta"
								onRequestSuccess={ onClose }
							/>
						</>
					);
				},
			},
		],
		[ dispatch, translate ]
	);
}
