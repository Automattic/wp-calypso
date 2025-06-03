import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
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
import OnboardingTourModal from '../../onboarding-tour-modal';

import './style.scss';

export const ONBOARDING_TOUR_HASH = '#onboarding-tour';

function useOnboardingTour() {
	const [ isOpen, setIsOpen ] = useState( false );

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( isEnabled( 'a4a-unified-onboarding-tour' ) && hash === ONBOARDING_TOUR_HASH ) {
				setIsOpen( true );
			}
		};

		// Check hash on mount
		handleHashChange();

		// Listen for hash changes
		window.addEventListener( 'hashchange', handleHashChange );

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	const onClose = useCallback( () => {
		setIsOpen( false );
		// Remove the hash from the URL
		window.history.replaceState( '', '', window.location.pathname );
	}, [] );

	return {
		isOpen,
		onClose,
	};
}

export function withOnboardingTour< T extends JSX.IntrinsicAttributes >(
	WrappedComponent: ComponentType< T >
) {
	return function WithOnboardingTourWrapper( props: T ) {
		const { isOpen, onClose } = useOnboardingTour();
		const translate = useTranslate();

		const sections = useMemo(
			() => [
				{
					id: 'onboarding-tour-welcome',
					title: translate( 'Welcome' ),
					bannerImage: OnboardingTourBannerWelcome,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Welcome to Automattic for Agencies!' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									"We're more than a site management platform—we're your partner in growing your WordPress agency. This quick tour highlights key features and benefits to help you boost revenue and streamline your workflows."
								) }
							</p>
							<p className="a4a-onboarding-tour__spoiler">
								{ translate(
									"{{b}}Spoiler alert:{{/b}} You can unlock serious earning potential, deliver better client results, and boost your agency's efficiency. Stick with the tour to see how, or jump in and explore—your progress is saved and you can pick it back up any time.",
									{
										components: {
											b: <b />,
										},
									}
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-sites',
					title: translate( 'Sites' ),
					bannerImage: OnboardingTourBannerSites,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'One dashboard. Every site. Seamless management.' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									"Monitor, manage, and optimize all your client sites—regardless of where they're hosted—right from the Automattic for Agencies dashboard."
								) }
								<br />
								<br />
								{ translate(
									'The lightweight plugin connects your sites in seconds. From there, use built-in Jetpack tools to track performance, boost speed, and keep things secure and backed up.'
								) }
							</p>
							<p className="a4a-onboarding-tour__spoiler">
								{ translate(
									'{{b}}Pro tip:{{/b}} Sites hosted on Pressable come with Jetpack Complete (a $800+ value per site, annually) at no extra cost.',
									{
										components: {
											b: <b />,
										},
									}
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-marketplace',
					title: translate( 'Marketplace' ),
					bannerImage: OnboardingTourBannerMarketplace,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Buy at a discount or earn commission—your choice!' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									'You now have the freedom to choose how you work with clients. Purchase products and hosting directly and enjoy volume discounts, or switch to referral mode and let clients pay while you earn up to 50% commission on products without the billing headaches.'
								) }
								<br />
								<br />
								{ translate( 'Did we mention this is a recurring commission?' ) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-purchases',
					title: translate( 'Purchases' ),
					bannerImage: OnboardingTourBannerPurchases,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Easily manage all your purchases in one spot.' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									'Assign Jetpack products and Woo extensions, launch WordPress.com sites, manage Pressable hosting, and access all your billing and invoices—no digging required.'
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-referrals',
					title: translate( 'Referrals' ),
					bannerImage: OnboardingTourBannerReferrals,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Track referrals and commissions with ease' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									"Send referrals through the marketplace, then head to your referrals dashboard to view total commissions, upcoming payouts, and the status of your clients' products and hosting."
								) }
								<br />
								<br />
								{ translate(
									'Have questions about commission rates and eligibility? Check the FAQ right in the Referrals dashboard.'
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-migrations',
					title: translate( 'Migrations' ),
					bannerImage: OnboardingTourBannerMigrations,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Better hosting for your clients. Up to $10K for you.' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									'Tired of subpar hosting? Migrate your sites to WordPress.com or Pressable and tap into WP Cloud—the only cloud platform built just for WordPress.'
								) }
								<br />
								<br />
								{ translate(
									'We offer 5 free development licenses on WordPress.com (only pay when you launch) and a free Pressable demo. See the difference for yourself.'
								) }
							</p>
							<p className="a4a-onboarding-tour__spoiler">
								{ translate(
									'{{b}}Limited time offer:{{/b}} Migrate your sites to Pressable or WordPress.com and earn up to $10,000*',
									{
										components: {
											b: <b />,
										},
									}
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-woopayments',
					title: translate( 'WooPayments' ),
					bannerImage: OnboardingTourBannerWooPayments,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">{ translate( 'Learn. Pitch. Earn.' ) }</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									"If you build sites using WooCommerce, you're leaving money on the table by not using WooPayments, Woo's fully-integrated payments solution. "
								) }
								<br />
								<br />
								{ translate(
									"We've made it easy for you to learn about WooPayments, copy and paste a pitch to send to your clients, and track your earnings from your referrals all in one place."
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-agency-tiers',
					title: translate( 'Agency Tiers' ),
					bannerImage: OnboardingTourBannerAgencyTiers,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Resources and rewards tailored for your growth' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									'Our Agency Tiers program unlocks exclusive perks—like co-marketing, directory placement, pre-qualified leads, and dedicated partner managers. More tools, more visibility, more ways to earn.'
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-team',
					title: translate( 'Team' ),
					bannerImage: OnboardingTourBannerTeam,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Invite your team. Reclaim your time.' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									'Running a growing agency is a team sport. With our dashboard, you can bring your whole crew along to help manage sites, send referrals, and keep clients happy.'
								) }
							</p>
						</div>
					),
				},
				{
					id: 'onboarding-tour-growth-call',
					title: translate( 'Free growth call' ),
					bannerImage: OnboardingTourBannerGrowthCall,
					content: (
						<div className="a4a-onboarding-tour">
							<h1 className="a4a-onboarding-tour__title">
								{ translate( 'Free agency growth call' ) }
							</h1>
							<p className="a4a-onboarding-tour__description">
								{ translate(
									"Set up time with one of our growth specialists to think more strategically about your agency's success. Together, we'll explore your goals, identify new opportunities, and share proven ways to attract and retain more clients. Reach out anytime — we're here to support you."
								) }
							</p>
						</div>
					),
				},
			],
			[ translate ]
		);

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal onClose={ onClose }>
						{ sections.map( ( section ) => (
							<OnboardingTourModal.Section
								key={ section.id }
								id={ section.id }
								title={ section.title }
								bannerImage={ section.bannerImage }
							>
								{ section.content }
							</OnboardingTourModal.Section>
						) ) }
					</OnboardingTourModal>
				) }
			</>
		);
	};
}
