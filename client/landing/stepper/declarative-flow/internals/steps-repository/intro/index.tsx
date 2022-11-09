import { LINK_IN_BIO_FLOW, NEWSLETTER_FLOW, ECOMMERCE_FLOW } from '@automattic/onboarding';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep, { IntroContent } from './intro';
import type { Step } from '../../types';

import './styles.scss';

const useIntroContent = ( flowName: string | null ): IntroContent => {
	const { __ } = useI18n();

	return useMemo( () => {
		if ( flowName === LINK_IN_BIO_FLOW ) {
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
				text: createInterpolateElement(
					__(
						`You’re a few steps away from launching a beautiful Newsletter with<br />everything you’ll ever need to grow your audience.`
					),
					{ br: <br /> }
				),
				buttonText: __( 'Start building your Newsletter' ),
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
		/>
	);
};

export default Intro;
