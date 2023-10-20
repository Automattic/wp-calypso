import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { PlansSelect } from 'calypso/../packages/data-stores/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { PLANS_STORE } from 'calypso/landing/stepper/stores';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalPortfolio: React.FC< IntroModalContentProps > = ( {
	onSubmit,
} ) => {
	const translate = useTranslate();
	const locale = useLocale();
	const { supportedPlans } = useSupportedPlans( locale, 'ANNUALLY' );
	const getPlanProduct = useSelect(
		( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProduct,
		[]
	);

	let getStartedText: string | ReactElement = translate( 'Get started' );
	let learnMoreText: string | React.ReactNode = translate(
		'{{a}}Or learn more about VideoPress{{/a}}',
		{
			components: {
				a: <a href="https://videopress.com/" target="_blank" rel="external noreferrer noopener" />,
			},
		}
	);

	let defaultSupportedPlan = supportedPlans.find( ( plan ) => {
		return plan.periodAgnosticSlug === 'premium';
	} );
	if ( ! defaultSupportedPlan ) {
		defaultSupportedPlan = supportedPlans.find( ( plan ) => {
			return plan.periodAgnosticSlug === 'business';
		} );
	}

	if ( defaultSupportedPlan ) {
		const planProductObject = getPlanProduct( defaultSupportedPlan.periodAgnosticSlug, 'ANNUALLY' );

		if ( planProductObject ) {
			// eslint-disable-next-line @wordpress/valid-sprintf
			getStartedText = config.isEnabled( 'videomaker-trial' )
				? translate( 'Start a free trial' )
				: sprintf(
						/* translators: Price displayed on VideoPress intro page. %s is monthly price. */
						translate( 'Get started - from %s/month' ),
						planProductObject.price
				  );

			if ( config.isEnabled( 'videomaker-trial' ) ) {
				learnMoreText = translate(
					/* translators: Displayed on VideoPress signup flow intro page. %(price)s is monthly price. */
					'After trial, plans start as low as %(price)s/month. {{a}}Learn more about VideoPress{{/a}}',
					{
						args: { price: planProductObject.price },
						components: {
							a: (
								<a
									href="https://videopress.com/"
									target="_blank"
									rel="external noreferrer noopener"
								/>
							),
						},
					}
				);
			}
		}
	}

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Your video portfolio, with no hassle.' ) }
			description={ translate(
				'Create a WordPress.com site with everything you need to share your videos with the world.'
			) }
			intent="portfolio"
			featuresList={ [
				translate( '{{a}}Videomaker{{/a}}, a premium theme optimized to display videos.', {
					components: {
						a: (
							<a
								href="https://videomakerdemo.wordpress.com/"
								target="_blank"
								rel="external noreferrer noopener"
							/>
						),
					},
				} ),
				translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
					components: {
						a: (
							<a href="https://videopress.com" target="_blank" rel="external noreferrer noopener" />
						),
					},
				} ),
				translate( 'Upload videos directly to your site using the WordPress editor.' ),
				translate( 'Up to 200GB of storage and your own domain for a year.' ),
			] }
			actionButton={ {
				type: 'button',
				text: getStartedText,
				onClick: onSubmit,
			} }
			learnMoreText={ learnMoreText }
		/>
	);
};

export default VideoPressOnboardingIntentModalPortfolio;
