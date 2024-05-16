import { Card } from '@automattic/components';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import { useSaveAnswersMutation, useSurveyStructureQuery } from 'calypso/data/segmentaton-survey';
import FlowCard from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/components/flow-card';
import StepWrapper from 'calypso/signup/step-wrapper';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

export default function InitialIntentStep( props: Props ) {
	const translate = useTranslate();
	const headerText = translate( 'What brings you to WordPress.com?' );
	const subHeaderText = translate(
		'This will help us tailor your onboarding experience to your needs.'
	);
	const surveyKey = 'guided-onboarding-flow';
	const { data: questions } = useSurveyStructureQuery( { surveyKey } );
	const { mutateAsync, isPending } = useSaveAnswersMutation( { surveyKey } );

	const handleNext = ( questionKey: string, answerKeys: string[], isLastQuestion?: boolean ) => {
		// const { proceedWithNavigation, providedDependencies } = shouldNavigate(
		// 	questionKey,
		// 	answerKeys,
		// 	isLastQuestion
		// );

		// if ( proceedWithNavigation ) {
		// 	// For custom navigation, we need to clear the answers before the last question
		// 	if ( ! isLastQuestion ) {
		// 		clearAnswers();
		// 	}

		// 	// recordCompleteEvent();
		// 	navigation.submit?.( providedDependencies );
		// }

		if ( isLastQuestion ) {
			props.goToNextStep();
		}
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<SegmentationSurvey surveyKey={ surveyKey } onBack={ () => {} } onNext={ handleNext } />
			}
			align="center"
			hideSkip
			{ ...props }
		/>
	);
}
