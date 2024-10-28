import config from '@automattic/calypso-config';
import { TIMELESS_PLAN_BUSINESS, TIMELESS_PLAN_PREMIUM } from '@automattic/data-stores/src/plans';
import { useLocale } from '@automattic/i18n-utils';
import {
	ECOMMERCE_FLOW,
	FREE_FLOW,
	NEWSLETTER_FLOW,
	SENSEI_FLOW,
	VIDEOPRESS_FLOW,
	isLinkInBioFlow,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { PlansSelect } from 'calypso/../packages/data-stores/src';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { PLANS_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep, { IntroContent } from './intro';
import VideoPressIntroModalContent from './videopress-intro-modal-content';
import type { Step } from '../../types';
import './styles.scss';

const useIntroContent = ( flowName: string | null ): IntroContent => {
	const { __ } = useI18n();
	const locale = useLocale();
	const { supportedPlans } = useSupportedPlans( locale, 'ANNUALLY' );
	const getPlanProduct = useSelect(
		( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProduct,
		[]
	);
	// VideoPress: we should always send a non-empty string so the spacing stays the same on the intro page
	let videoPressGetStartedText: string | ReactElement = createInterpolateElement( '<nbsp />', {
		nbsp: <>&nbsp;</>,
	} );

	if ( VIDEOPRESS_FLOW === flowName ) {
		const isTrialEnabled = config.isEnabled( 'videomaker-trial' );
		let defaultSupportedPlan = supportedPlans.find( ( plan ) => {
			return plan.periodAgnosticSlug === TIMELESS_PLAN_PREMIUM;
		} );
		if ( ! defaultSupportedPlan ) {
			defaultSupportedPlan = supportedPlans.find( ( plan ) => {
				return plan.periodAgnosticSlug === TIMELESS_PLAN_BUSINESS;
			} );
		}

		if ( defaultSupportedPlan ) {
			const planProductObject = getPlanProduct(
				defaultSupportedPlan.periodAgnosticSlug,
				'ANNUALLY'
			);

			if ( planProductObject ) {
				videoPressGetStartedText = isTrialEnabled
					? // eslint-disable-next-line @wordpress/valid-sprintf
					  sprintf(
							/* translators: Price displayed on VideoPress intro page. First %s is monthly price, second is annual price */
							__( 'After trial, plans start as low as %s per month, %s billed annually' ),
							planProductObject.price,
							planProductObject.annualPrice
					  )
					: // eslint-disable-next-line @wordpress/valid-sprintf
					  sprintf(
							/* translators: Price displayed on VideoPress intro page. First %s is monthly price, second is annual price */
							__( 'Starts at %s per month, %s billed annually' ),
							planProductObject.price,
							planProductObject.annualPrice
					  );
			}
		}
	}

	return useMemo( () => {
		if ( isLinkInBioFlow( flowName ) ) {
			return {
				title: createInterpolateElement(
					__( 'You’re 3 minutes away from<br />a stand-out Link in Bio site.<br />Ready?' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
			};
		}

		if ( flowName === ECOMMERCE_FLOW ) {
			return {
				title: createInterpolateElement( __( 'Set up your online store<br />in minutes' ), {
					br: <br />,
				} ),
				buttonText: __( 'Create your store' ),
			};
		}

		if ( flowName === NEWSLETTER_FLOW ) {
			return {
				title: __( 'Write. Grow. Earn. This is Newsletter.' ),
				text: __(
					'Unlimited subscribers. Everything you need to grow your audience. And the permanence of WordPress.com.'
				),
				buttonText: __( 'Launch my newsletter' ),
			};
		}

		if ( flowName === SENSEI_FLOW ) {
			return {
				title: createInterpolateElement(
					__( 'You are minutes away from<br />being ready to launch your<br />first course.' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
				secondaryButtonText: __( 'Learn more' ),
			};
		}

		if ( flowName === VIDEOPRESS_FLOW ) {
			const isTrialEnabled = config.isEnabled( 'videomaker-trial' );
			return {
				title: createInterpolateElement(
					__( 'A home for all your videos.<br />Play. Roll. Share.' ),
					{ br: <br /> }
				),
				secondaryText: videoPressGetStartedText,
				buttonText: isTrialEnabled ? __( 'Start a free trial' ) : __( 'Get started' ),
				modal: {
					buttonText: __( 'Learn more' ),
					onClick: () => recordTracksEvent( 'calypso_videopress_signup_learn_more_button_clicked' ),
					content: VideoPressIntroModalContent,
				},
			};
		}

		if ( flowName === FREE_FLOW ) {
			return {
				title: createInterpolateElement(
					__( 'You’re 1 minute away from<br />a beautiful, free website.<br />Ready?' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
			};
		}

		return {
			title: createInterpolateElement(
				__( 'You’re 3 minutes away from<br />a launch-ready newsletter.' ),
				{ br: <br /> }
			),
			buttonText: __( 'Get started' ),
		};
	}, [ flowName, __, videoPressGetStartedText ] );
};

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const introContent = useIntroContent( flow );
	const isVideoPressFlow = 'videopress' === flow;

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			stepName="intro"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout
			isLargeSkipLayout={ false }
			stepContent={ <IntroStep introContent={ introContent } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered={ flow === NEWSLETTER_FLOW }
			showHeaderWooCommercePowered={ flow === ECOMMERCE_FLOW }
			showSenseiPowered={ flow === SENSEI_FLOW }
			showVideoPressPowered={ isVideoPressFlow }
		/>
	);
};

export default Intro;
