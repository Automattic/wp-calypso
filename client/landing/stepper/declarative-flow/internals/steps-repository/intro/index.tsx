import { useLocale } from '@automattic/i18n-utils';
import { LINK_IN_BIO_FLOW, NEWSLETTER_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import cx from 'classnames';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep, { IntroContent } from './intro';
import type { Step } from '../../types';

import './styles.scss';

const useIntroContent = ( flowName: string | null ): IntroContent => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();

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
		if ( flowName === VIDEOPRESS_FLOW ) {
			return {
				title: createInterpolateElement(
					__( 'A home for all your videos.<br />Play. Roll. Share.' ),
					{ br: <br /> }
				),
				buttonText: __( 'Get started' ),
			};
		}
		if (
			locale === 'en' ||
			[
				`Sign in. Set up. Send out.`,
				`You’re a few steps away from launching a beautiful Newsletter with<br />everything you’ll ever need to grow your audience.`,
				'Start building your Newsletter',
			].every( ( translation ) => hasTranslation( translation ) )
		) {
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
	}, [ flowName, locale, __, hasTranslation ] );
};

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const introContent = useIntroContent( flow );
	const showNewNewsletterIntro = flow === NEWSLETTER_FLOW && 'text' in introContent;
	const isVideoPressFlow = 'videopress' === flow;

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			stepName="intro"
			className={ cx( { 'is-using-new-intro-design': showNewNewsletterIntro } ) }
			flowName={ flow as string }
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <IntroStep introContent={ introContent } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ showNewNewsletterIntro }
			showJetpackPowered={ flow === NEWSLETTER_FLOW && ! showNewNewsletterIntro }
			showVideoPressPowered={ isVideoPressFlow }
		/>
	);
};

export default Intro;
