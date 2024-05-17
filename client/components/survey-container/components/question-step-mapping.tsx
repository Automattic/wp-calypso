import { QuestionType } from '../types';
import { QuestionSelectionComponentProps } from './question-step';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyFlowCardControl from './survey-flow-card';
import SurveyRadioControl from './survey-radio-control';

type questionTypeComponentMapProps = {
	[ QuestionType.SINGLE_CHOICE ]: ( {
		onChange,
		question,
		value,
		disabled,
		onContinue,
	}: QuestionSelectionComponentProps ) => JSX.Element;
	[ QuestionType.MULTIPLE_CHOICE ]: ( {
		onChange,
		question,
		value,
		disabled,
		onContinue,
	}: QuestionSelectionComponentProps ) => JSX.Element;
};

type questionHeaderButtonsMapProps = {
	[ key: string ]: {
		shouldHideContinueButton: boolean;
		shouldHideSkipButton: boolean;
	};
};

export const questionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyRadioControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export const flowQuestionMapping: {
	[ key: string ]: {
		questionTypeComponentMap: questionTypeComponentMapProps;
		headerButtonsMapping: questionHeaderButtonsMapProps;
	};
} = {
	'/start/guided/initial-intent': {
		questionTypeComponentMap: {
			[ QuestionType.SINGLE_CHOICE ]: SurveyFlowCardControl,
			[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
		},
		headerButtonsMapping: {
			'what-brings-you-to-wordpress': {
				shouldHideContinueButton: true,
				shouldHideSkipButton: true,
			},
			'what-are-your-goals': {
				shouldHideContinueButton: false,
				shouldHideSkipButton: false,
			},
		},
	},
};
