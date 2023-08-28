import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import '../intro/videopress-intro-modal-styles.scss';
import { PlansSelect } from 'calypso/../packages/data-stores/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { PLANS_STORE } from 'calypso/landing/stepper/stores';
import CheckmarkIcon from '../intro/icons/checkmark-icon';
import { IntroModalContentProps } from '../intro/intro';

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
			getStartedText = sprintf(
				/* translators: Price displayed on VideoPress intro page. %s is monthly price. */
				translate( 'Get started - from %s/month' ),
				planProductObject.price
			);
		}
	}

	return (
		<div className="videopress-intro-modal">
			<h1 className="intro__title">{ translate( 'Your video portfolio, with no hassle.' ) }</h1>
			<div className="intro__description">
				{ translate(
					'Create a WordPress.com site with everything you need to share your videos with the world.'
				) }
			</div>
			<ul className="videopress-intro-modal__list">
				<li>
					<CheckmarkIcon />
					<span>
						{ translate( '{{a}}Videomaker{{/a}}, a premium theme optimized to display videos.', {
							components: {
								a: (
									<a
										href="https://videomakerdemo.wordpress.com/"
										target="_blank"
										rel="external noreferrer noopener"
									/>
								),
							},
						} ) }
					</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>
						{ translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
							components: {
								a: (
									<a
										href="https://videopress.com"
										target="_blank"
										rel="external noreferrer noopener"
									/>
								),
							},
						} ) }
					</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>
						{ translate( 'Upload videos directly to your site using the WordPress editor.' ) }
					</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>{ translate( 'Up to 200GB of storage and your own domain for a year.' ) }</span>
				</li>
			</ul>
			<div className="videopress-intro-modal__button-column">
				<Button className="intro__button" primary onClick={ onSubmit }>
					{ getStartedText }
				</Button>
				<div className="learn-more">
					{ translate( '{{a}}Or learn more about VideoPress.{{/a}}', {
						components: {
							a: (
								<a
									href="https://videopress.com/"
									target="_blank"
									rel="external noreferrer noopener"
								/>
							),
						},
					} ) }
				</div>
			</div>
			<div className="videopress-intro-modal__screenshots">
				<img
					src="https://videopress2.files.wordpress.com/2023/02/videopress-modal-screenshots-2x.png"
					alt={ translate( 'Mobile device screenshot samples of the Videomaker theme.' ) }
				/>
			</div>
		</div>
	);
};

export default VideoPressOnboardingIntentModalPortfolio;
