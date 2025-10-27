import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import OverviewSidebarGrowthAcceleratorCta from 'calypso/a8c-for-agencies/sections/overview/sidebar/growth-accelerator/cta';
import { A4A_REPORTS_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import OnboardingTourBannerAgencyTiers from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-agency-tiers.svg';
import OnboardingTourBannerGrowthCall from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-growth-call.svg';
import OnboardingTourBannerMarketplace from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-marketplace.svg';
import OnboardingTourBannerMigrations from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-migrations.svg';
import OnboardingTourBannerPartnerDirectory from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-partner-directory.svg';
import OnboardingTourBannerPurchases from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-purchases.svg';
import OnboardingTourBannerReferrals from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-referrals.svg';
import OnboardingTourBannerReports from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-reports.svg';
import OnboardingTourBannerSites from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-sites.svg';
import OnboardingTourBannerTeam from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-team.svg';
import OnboardingTourBannerWelcome from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-welcome.svg';
import OnboardingTourBannerWooPayments from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-woopayments.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { RenderableAction, RenderableActionProps } from '../../../onboarding-tour-modal/section';
import {
	A4A_MARKETPLACE_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_OVERVIEW_LINK,
	A4A_PURCHASES_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK,
	A4A_AGENCY_TIER_LINK,
	A4A_TEAM_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from '../../../sidebar-menu/lib/constants';
import useCurrentOnboardingSection from './use-current-onboarding-section';

export default function useOnboardingTourSections() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { saveCurrentSection } = useCurrentOnboardingSection();

	return useMemo( () => {
		const onNextBenefit = ( section: string, onNext: () => void ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click', {
					section,
				} )
			);
			onNext();
		};

		const onExplore = ( section: string, onClose: () => void ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_feature_click', {
					section,
				} )
			);
			saveCurrentSection( section );
			onClose();
		};

		return [
			{
				id: 'overview',
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
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Check out the Overview page' ),
							variant: 'secondary',
							href: A4A_OVERVIEW_LINK,
							onClick: () => onExplore( 'overview', onClose ),
						},
						{
							label: translate( 'Start tour' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'overview', onNext ),
						},
					];
				},
			},
			{
				id: 'sites',
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
						'{{b}}Pro tip:{{/b}} Sites hosted on Pressable come with Jetpack Complete (a %(valuePerSite)s value per site, annually) at no extra cost.',
						{
							components: {
								b: <b />,
							},
							args: {
								valuePerSite: `${ formatCurrency( 800, 'USD', {
									stripZeros: true,
								} ) }+`,
							},
						}
					),
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Connect your first site' ),
							variant: 'secondary',
							href: A4A_SITES_LINK,
							onClick: () => onExplore( 'sites', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'sites', onNext ),
						},
					];
				},
			},
			{
				id: 'marketplace',
				title: translate( 'Marketplace' ),
				bannerImage: OnboardingTourBannerMarketplace,
				isDarkBanner: true,
				content: {
					title: translate( 'Buy at a discount or earn commission—your choice!' ),
					descriptions: [
						translate(
							'Our marketplace is a one-stop shop for all of your client hosting and product needs. Enjoy up to 80% off with volume discounts, or switch to referral mode and let clients pay while you earn up to 50% commission without the billing headaches.'
						),
						translate( 'Did we mention this is a recurring commission?' ),
					],
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Explore products & hosting' ),
							variant: 'secondary',
							href: A4A_MARKETPLACE_LINK,
							onClick: () => onExplore( 'marketplace', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'marketplace', onNext ),
						},
					];
				},
			},
			{
				id: 'purchases',
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
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'View purchases' ),
							variant: 'secondary',
							href: A4A_PURCHASES_LINK,
							onClick: () => onExplore( 'purchases', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'purchases', onNext ),
						},
					];
				},
			},
			{
				id: 'referrals',
				title: translate( 'Referrals' ),
				bannerImage: OnboardingTourBannerReferrals,
				content: {
					title: translate( 'Track referrals and commissions with ease' ),
					descriptions: [
						translate(
							"Send referrals through the marketplace, then head to your referrals dashboard to view total commissions, upcoming payouts, and the status of your clients' products and hosting."
						),
						translate(
							"You'll earn a 20% recurring commission for referring Pressable or WordPress.com hosting, and a 50% recurring commission for referring Woo or Jetpack products."
						),
					],
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'View Referrals Dashboard' ),
							variant: 'secondary',
							href: A4A_REFERRALS_DASHBOARD,
							onClick: () => onExplore( 'referrals', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'referrals', onNext ),
						},
					];
				},
			},
			{
				id: 'migrations',
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
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'View migration offer' ),
							variant: 'secondary',
							href: A4A_MIGRATIONS_LINK,
							onClick: () => onExplore( 'migrations', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'migrations', onNext ),
						},
					];
				},
			},
			{
				id: 'woopayments',
				title: translate( 'WooPayments' ),
				bannerImage: OnboardingTourBannerWooPayments,
				isDarkBanner: true,
				content: {
					title: translate( 'Learn. Pitch. Earn.' ),
					descriptions: [
						translate(
							"If you build sites using WooCommerce, you're leaving money on the table by not using WooPayments, Woo's fully-integrated payments solution."
						),
						translate(
							"For any new client stores that you add WooPayments to, you'll earn a 5 BPS recurring commission on store sales."
						),
						translate(
							"We've made it easy for you to learn about WooPayments, copy and paste a pitch to send to your clients, and track your earnings from your referrals all in one place."
						),
					],
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Check out WooPayments' ),
							variant: 'secondary',
							href: A4A_WOOPAYMENTS_OVERVIEW_LINK,
							onClick: () => onExplore( 'woopayments', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'woopayments', onNext ),
						},
					];
				},
			},
			{
				id: 'reports',
				title: translate( 'Reports' ),
				bannerImage: OnboardingTourBannerReports,
				isDarkBanner: true,
				content: {
					title: translate( 'Create professional reports for your clients' ),
					descriptions: [
						translate(
							"Prove your agency's impact with polished, easy-to-read reports that highlight key traffic stats from your clients' sites."
						),
						translate(
							'Our streamlined report builder makes it easy to create professional client reports in minutes.'
						),
					],
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Check out Client Reports' ),
							variant: 'secondary',
							href: A4A_REPORTS_OVERVIEW_LINK,
							onClick: () => onExplore( 'reports', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'reports', onNext ),
						},
					];
				},
			},
			{
				id: 'partner-directory',
				title: translate( 'Partner Directories' ),
				bannerImage: OnboardingTourBannerPartnerDirectory,
				isDarkBanner: true,
				content: {
					title: translate( 'Get leads from multiple agency directories' ),
					descriptions: [
						translate(
							"By partnering with us, you're eligible to be listed on up to four agency directories across our Woo, Pressable, WordPress.com, and Jetpack sites."
						),
						translate(
							'To get listed on these directories, you have to qualify for our Agency Partner tier and demonstrate expertise with each of the brands that you would like to be listed with.'
						),
					],
				},
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Check out Partner Directories' ),
							variant: 'secondary',
							href: A4A_PARTNER_DIRECTORY_LINK,
							onClick: () => onExplore( 'partner-directory', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'partner-directory', onNext ),
						},
					];
				},
			},
			{
				id: 'agency-tiers',
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
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Check out Agency Tiers' ),
							variant: 'secondary',
							href: A4A_AGENCY_TIER_LINK,
							onClick: () => onExplore( 'agency-tiers', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'agency-tiers', onNext ),
						},
					];
				},
			},
			{
				id: 'team',
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
				renderableActions: ( { onNext, onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'Add your team' ),
							variant: 'secondary',
							href: A4A_TEAM_LINK,
							onClick: () => onExplore( 'team', onClose ),
						},
						{
							label: translate( 'Next benefit' ),
							variant: 'primary',
							onClick: () => onNextBenefit( 'team', onNext ),
						},
					];
				},
			},
			{
				id: 'growth-call',
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
				renderableActions: ( { onClose }: RenderableActionProps ): RenderableAction[] => {
					return [
						{
							label: translate( 'End tour' ),
							variant: 'secondary',
							onClick: () => {
								dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_end_tour_click' ) );
								onClose();
							},
						},
						<OverviewSidebarGrowthAcceleratorCta
							key="onboarding-tour-growth-call-cta"
							className="a4a-onboarding-tour__schedule-a-call-cta"
							onRequestSuccess={ onClose }
						/>,
					];
				},
			},
		];
	}, [ dispatch, saveCurrentSection, translate ] );
}
