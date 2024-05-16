import { QuestionType } from '../types';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyFlowCardControl from './survey-flow-card';
import SurveyRadioControl from './survey-radio-control';

const guidedOnboardingFlowTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyFlowCardControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

const headerButtonsMapping = {
	'what-brings-you-to-wordpress': {
		shouldHideContinueButton: true,
		shouldHideSkipButton: true,
	},
	'what-are-your-goals': {
		shouldHideContinueButton: false,
		shouldHideSkipButton: false,
	},
};

export const questionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyRadioControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export const flowQuestionMapping = {
	'/start/guided/initial-intent': {
		questionTypeComponentMap: guidedOnboardingFlowTypeComponentMap,
		headerButtonsMapping: headerButtonsMapping,
	},
};
