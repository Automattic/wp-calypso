import { NEWSLETTER_FLOW } from '@automattic/onboarding';
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
		if ( flowName === NEWSLETTER_FLOW ) {
			return {
				title: __( 'Write. Grow. Earn. This is Newsletter.' ),
				text: __(
					'Unlimited subscribers. Everything you need to grow your audience. And the permanence of WordPress.com.'
				),
				buttonText: __( 'Launch my newsletter' ),
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
		/>
	);
};

export default Intro;
