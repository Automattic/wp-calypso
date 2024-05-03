import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
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

export type QuestionSelectionComponentProps = {
	question: Question;
	value?: string[];
	onChange: ( questionKey: string, value: string[] ) => void;
	disabled?: boolean;
};

type QuestionStepType = {
	onBack: () => void;
	onContinue: () => void;
	onSkip: () => void;
	hideBack?: boolean;
} & QuestionSelectionComponentProps;

const QuestionStep = ( {
	question,
	value = [],
	onChange,
	onBack,
	onContinue,
	onSkip,
	disabled,
	hideBack,
}: QuestionStepType ) => {
	const translate = useTranslate();
	const SelectionComponent = questionTypeComponentMap[ question.type ];

	return (
		<StepContainer
			className={ classNames( 'question-step', { disabled } ) }
			hideBack={ hideBack }
			hideSkip={ question.required }
			goBack={ onBack }
			goNext={ onSkip }
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
					<SelectionComponent
						question={ question }
						value={ value }
						onChange={ onChange }
						disabled={ disabled }
					/>
					<Button
						className="question-step__continue-button"
						onClick={ onContinue }
						variant="primary"
						disabled={ disabled || ( question.required && value.length === 0 ) }
					>
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
