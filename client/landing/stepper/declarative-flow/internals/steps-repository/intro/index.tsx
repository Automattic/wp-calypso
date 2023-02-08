import {
	NEWSLETTER_FLOW,
	ECOMMERCE_FLOW,
	VIDEOPRESS_FLOW,
	FREE_FLOW,
	isLinkInBioFlow,
} from '@automattic/onboarding';
import { createInterpolateElement, useMemo } from '@wordpress/element';
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
					__( 'You’re 3 minutes away from<br />a stand-out Link in Bio site.<br />Ready? ' ),
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
				title: __( 'Sign in. Set up. Send out.' ),
				text: __(
					`You’re a few steps away from launching a beautiful Newsletter with everything you’ll ever need to grow your audience.`
				),
				buttonText: __( 'Start building your Newsletter' ),
			};
		}

		if ( flowName === VIDEOPRESS_FLOW ) {
			return {
				title: createInterpolateElement(
					__( 'A home for all your videos.<br />Play. Roll. Share.' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
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
					__( 'You’re 1 minute away from<br />a beautiful, free website.<br />Ready? ' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
			};
		}

		return {
			title: createInterpolateElement(
				__( 'You’re 3 minutes away from<br />a launch-ready Newsletter. ' ),
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
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <IntroStep introContent={ introContent } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ flow === NEWSLETTER_FLOW }
			showHeaderWooCommercePowered={ flow === ECOMMERCE_FLOW }
			showVideoPressPowered={ isVideoPressFlow }
		/>
	);
};

export default Intro;
