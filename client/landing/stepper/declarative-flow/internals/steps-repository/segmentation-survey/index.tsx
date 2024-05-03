import Main from 'calypso/components/main';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import { useCachedAnswers } from 'calypso/data/segmentaton-survey';
import type { ProvidedDependencies, Step } from '../../types';
import './style.scss';

const SURVEY_KEY = 'entrepreneur-trial';

type NavigationDecision = {
	proceedWithNavigation: boolean;
	providedDependencies: ProvidedDependencies;
};

const shouldNavigate = (
	questionKey: string,
	answerKeys: string[],
	isLastQuestion?: boolean
): NavigationDecision => {
	return {
		proceedWithNavigation: !! isLastQuestion,
		providedDependencies: {},
	};
};

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const { clearAnswers } = useCachedAnswers( SURVEY_KEY );

	const handleNext = ( questionKey: string, answerKeys: string[], isLastQuestion?: boolean ) => {
		const { proceedWithNavigation, providedDependencies } = shouldNavigate(
			questionKey,
			answerKeys,
			isLastQuestion
		);

		if ( proceedWithNavigation ) {
			// For custom navigation, we need to clear the answers before the last question
			if ( ! isLastQuestion ) {
				clearAnswers();
			}

			navigation.submit?.( providedDependencies );
		}
	};

	return (
		<Main className="segmentation-survey-step">
			<SegmentationSurvey
				surveyKey={ SURVEY_KEY }
				onBack={ navigation.goBack }
				onNext={ handleNext }
			/>
		</Main>
	);
};

export default SegmentationSurveyStep;
