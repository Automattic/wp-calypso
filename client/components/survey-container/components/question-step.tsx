import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { Question, QuestionType } from '../types';
import QuestionMultipleOptions from './question-multiple-selection';
import QuestionSingleOption from './question-single-selection';
import './style.scss';

const questionTypeComponentMap = {
	[ QuestionType.SINGLE_CHOICE ]: QuestionSingleOption,
	[ QuestionType.MULTIPLE_CHOICE ]: QuestionMultipleOptions,
};

export type QuestionSelectionType = {
	question: Question;
	value: string[];
	onChange: ( questionKey: string, value: string[] ) => void;
};

type QuestionStepType = {
	previousPage: () => void;
	nextPage: () => void;
	skip: () => void;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
} & QuestionSelectionType;

const QuestionStep = ( {
	previousPage,
	nextPage,
	skip,
	question,
	value,
	onChange,
	recordTracksEvent,
}: QuestionStepType ) => {
	const translate = useTranslate();
	const SelectionComponent = questionTypeComponentMap[ question.type ];

	return (
		<StepContainer
			className="question-step"
			goBack={ previousPage }
			goNext={ skip }
			formattedHeader={
				<FormattedHeader
					align="left"
					headerText={ question.headerText }
					subHeaderText={ question.subHeaderText }
				/>
			}
			shouldStickyNavButtons={ true }
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
