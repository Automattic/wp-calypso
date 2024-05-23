import { QuestionType } from '../types';
import { QuestionSelectionComponentProps } from './question-step';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyFlowCardControl from './survey-flow-card';
import SurveyRadioControl from './survey-radio-control';

export const defaultQuestionComponentMap: QuestionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyRadioControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export const flowQuestionComponentMap: QuestionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyFlowCardControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export type QuestionTypeComponentMap = Record<
	string,
	React.ComponentType< QuestionSelectionComponentProps >
>;
