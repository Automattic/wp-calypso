import { Question } from '../../types';
import { flowQuestionMapping, questionTypeComponentMap } from '../question-step-mapping';

const getQuestionStepProps = ( question: Question, flowPath: string ) => {
	const flowMappingProps = flowQuestionMapping[ flowPath ];
	let questionTypeComponentMapping = questionTypeComponentMap;
	let shouldHideContinueButton = false;
	let shouldHideSkipButton = false;

	if ( flowMappingProps ) {
		questionTypeComponentMapping = flowMappingProps.questionTypeComponentMap;
		( { shouldHideContinueButton = false, shouldHideSkipButton = false } =
			flowMappingProps.headerButtonsMapping
				? flowMappingProps.headerButtonsMapping[ question.key ]
				: {} );
	}

	return {
		questionTypeComponentMapping,
		shouldHideContinueButton,
		shouldHideSkipButton,
	};
};

export default getQuestionStepProps;
