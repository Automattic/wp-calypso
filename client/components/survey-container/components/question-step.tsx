import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Question, QuestionType } from '../types';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyRadioControl from './survey-radio-control';
import './style.scss';

const questionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: SurveyRadioControl,
	[ QuestionType.MULTIPLE_CHOICE ]: SurveyCheckboxControl,
};

export type QuestionSelectionType = {
	question: Question;
	value: string[];
	onChange: ( questionKey: string, value: string[] ) => void;
};

type QuestionStepType = {
	hideBack: boolean;
	previousPage: () => void;
	nextPage: () => void;
	skip: () => void;
} & QuestionSelectionType;

const QuestionStep = ( {
	hideBack,
	previousPage,
	nextPage,
	skip,
	question,
	value,
	onChange,
}: QuestionStepType ) => {
	const translate = useTranslate();
	const SelectionComponent = questionTypeComponentMap[ question.type ];

	return (
		<StepContainer
			className="question-step"
			hideBack={ hideBack }
			goBack={ previousPage }
			goNext={ skip }
			formattedHeader={
				<FormattedHeader
					align="left"
					headerText={ question.headerText }
					subHeaderText={ question.subHeaderText }
				/>
			}
			stepName={ question.key }
			stepContent={
				<div className="question-step__content">
					<SelectionComponent question={ question } value={ value } onChange={ onChange } />
					<Button className="question-step__continue-button" onClick={ nextPage } variant="primary">
						{ translate( 'Continue' ) }
					</Button>
				</div>
			}
			skipLabelText={ translate( 'Skip' ) }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default QuestionStep;
