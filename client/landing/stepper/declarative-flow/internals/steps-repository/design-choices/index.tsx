import { OnboardSelect } from '@automattic/data-stores';
import { themesIllustrationImage } from '@automattic/design-picker';
import { Step, StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import hiBigSky from './big-sky-no-text.svg';
import DesignChoice from './design-choice';
import type { Step as StepType } from '../../types';

import './style.scss';

/**
 * The design choices step
 */
const DesignChoicesStep: StepType< { submits: { destination: string } } > = ( {
	navigation,
	flow,
	stepName,
} ) => {
	const isUsingStepContainerV2 = shouldUseStepContainerV2( flow );

	const translate = useTranslate();
	const { submit, goBack } = navigation;

	const documentHeaderText = translate( 'How would you like to design your site?' );
	const headerText = translate(
		'Time to build your site!{{br/}}How would you like to get started?',
		{
			components: {
				br: <br />,
			},
		}
	);

	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { isEligible } = useIsBigSkyEligible();

	useEffect( () => {
		if ( isEligible ) {
			recordTracksEvent( 'calypso_big_sky_view_choice', {
				flow,
				step: stepName,
			} );
		}
	}, [ isEligible, flow, stepName ] );

	const handleSubmit = ( destination: string ) => {
		recordTracksEvent( 'calypso_signup_design_choices_submit', {
			flow,
			step: stepName,
			intent,
			destination: kebabCase( destination ),
		} );

		submit?.( { destination } );
	};

	const stepContent = (
		<>
			<DesignChoice
				title={ translate( 'Choose a theme' ) }
				description={ translate( 'Our professionally designed themes make starting easy.' ) }
				imageSrc={ themesIllustrationImage }
				destination="design-setup"
				onSelect={ handleSubmit }
			/>

			{ isEligible && (
				<DesignChoice
					className="design-choices__try-big-sky"
					title={ translate( 'Create your site with AI' ) }
					description={ translate(
						'Tell the AI what you need, and watch it build a custom site in seconds.'
					) }
					bgImageSrc={ hiBigSky }
					destination="launch-big-sky"
					onSelect={ ( destination ) => {
						recordTracksEvent( 'calypso_big_sky_choose', {
							flow,
							step: stepName,
						} );
						handleSubmit( destination );
					} }
				/>
			) }
		</>
	);

	if ( isUsingStepContainerV2 ) {
		return (
			<>
				<DocumentHead title={ documentHeaderText } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					className={ clsx( 'design-choices__body' ) }
					topBar={
						<Step.TopBar
							leftElement={
								navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
							}
						/>
					}
					heading={ <Step.Heading text={ documentHeaderText } /> }
				>
					{ stepContent }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ documentHeaderText } />
			<StepContainer
				flowName={ flow }
				stepName={ stepName }
				isHorizontalLayout={ false }
				formattedHeader={ <FormattedHeader headerText={ headerText } /> }
				stepContent={ <div className={ clsx( 'design-choices__body' ) }>{ stepContent }</div> }
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
