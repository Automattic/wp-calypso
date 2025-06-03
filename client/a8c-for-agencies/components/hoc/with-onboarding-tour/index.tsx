import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import onboardingTourBannerSites from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-sites.svg';
import onboardingTourBannerWelcome from 'calypso/assets/images/a8c-for-agencies/onboarding-tour-banner-welcome.svg';
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
					bannerImage: onboardingTourBannerWelcome,
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
					bannerImage: onboardingTourBannerSites,
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
