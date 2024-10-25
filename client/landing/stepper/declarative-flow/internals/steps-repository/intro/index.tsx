import {
	ECOMMERCE_FLOW,
	FREE_FLOW,
	NEWSLETTER_FLOW,
	SENSEI_FLOW,
	isLinkInBioFlow,
	isVideoPressTVFlow,
} from '@automattic/onboarding';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep, { IntroContent } from './intro';
import VideoPressIntroModalContent from './videopress-intro-modal-content';
import type { Step } from '../../types';
import './styles.scss';

const useIntroContent = ( flowName: string | null ): IntroContent => {
	const { __ } = useI18n();

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

		if ( isVideoPressTVFlow( flowName ) ) {
			return {
				title: createInterpolateElement(
					__( 'An ad-free, home for all your videos.<br />Play. Roll. Share.' ),
					{ br: <br /> }
				),
				secondaryText: sprintf(
					/* translators: Days of trial displayed on VideoPress intro page. First %s is days of trial. */
					__( 'Start your %s-day free trial' ),
					30
				),
				buttonText: __( 'Get started' ),
				modal: {
					buttonText: __( 'Learn more' ),
					onClick: () =>
						recordTracksEvent( 'calypso_videopress_tv_signup_learn_more_button_clicked' ),
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
	}, [ flowName, __ ] );
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
