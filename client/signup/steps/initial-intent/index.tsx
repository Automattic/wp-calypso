import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import useSegmentationSurveyTracksEvents from 'calypso/components/segmentation-survey/hooks/use-segmentation-survey-tracks-events';
import { flowQuestionComponentMap } from 'calypso/components/survey-container/components/question-step-mapping';
import { QuestionConfiguration } from 'calypso/components/survey-container/types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './styles.scss';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

const SURVEY_KEY = 'guided-onboarding-flow';

const QUESTION_CONFIGURATION: QuestionConfiguration = {
	'what-brings-you-to-wordpress': {
		hideContinue: true,
		hideSkip: true,
	},
	'what-are-your-goals': {
		hideContinue: false,
		hideSkip: false,
	},
};

export default function InitialIntentStep( props: Props ) {
	const translate = useTranslate();
	const headerText = translate( 'What brings you to WordPress.com?' );
	const subHeaderText = translate(
		'This will help us tailor your onboarding experience to your needs.'
	);

	const { recordStartEvent, recordCompleteEvent } = useSegmentationSurveyTracksEvents( SURVEY_KEY );

	// Record Tracks start event on component mount
	useEffect( () => {
		recordStartEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const handleNext = ( _questionKey: string, _answerKeys: string[], isLastQuestion?: boolean ) => {
		if ( isLastQuestion ) {
			recordCompleteEvent();
			props.goToNextStep();
		}
	};

	return (
		<StepWrapper
			hideFormattedHeader
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<SegmentationSurvey
					surveyKey={ SURVEY_KEY }
					onNext={ handleNext }
					questionConfiguration={ QUESTION_CONFIGURATION }
					questionTypeComponentMap={ flowQuestionComponentMap }
				/>
			}
			align="center"
			hideSkip
			{ ...props }
		/>
	);
}
