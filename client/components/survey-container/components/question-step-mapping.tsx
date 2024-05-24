import { QuestionType } from '../types';
import { QuestionSelectionComponentProps } from './question-step';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyFlowCardControl from './survey-flow-card';
import SurveyRadioControl from './survey-radio-control';

export type QuestionComponentMap = Record<
	string,
	React.ComponentType< QuestionSelectionComponentProps >
>;

export const defaultQuestionComponentMap: QuestionComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyRadioControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export const flowQuestionComponentMap: QuestionComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyFlowCardControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};
