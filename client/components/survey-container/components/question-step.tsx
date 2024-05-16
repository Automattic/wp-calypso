import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Question, QuestionType } from '../types';
import getQuestionProps from './hooks/get-question-props';
import SurveyCheckboxControl from './survey-checkbox-control';
import SurveyRadioControl from './survey-radio-control';
import './style.scss';

export type QuestionSelectionComponentProps = {
	question: Question;
	value: string[];
	onChange: ( questionKey: string, value: string[] ) => void;
	disabled?: boolean;
	onContinue?: () => void;
};

type QuestionStepType = {
	onBack: () => void;
	onContinue: () => void;
	onSkip: () => void;
	hideBack?: boolean;
} & QuestionSelectionComponentProps;

const QuestionStep = ( {
	question,
	value,
	onChange,
	onBack,
	onContinue,
	onSkip,
	disabled,
	hideBack,
}: QuestionStepType ) => {
	const translate = useTranslate();
	const flowPath = window.location.pathname;
	const { questionTypeComponentMapping, shouldHideContinueButton, shouldHideSkipButton } =
		getQuestionProps( question, flowPath );

	console.log( { questionTypeComponentMapping, shouldHideContinueButton, shouldHideSkipButton } );
	const SelectionComponent = questionTypeComponentMapping[ question.type ];

	return (
		<StepContainer
			className={ classNames( 'question-step', { disabled } ) }
			hideBack={ hideBack }
			goBack={ onBack }
			goNext={ onSkip }
			formattedHeader={
				<FormattedHeader
					align="center"
					headerText={ question.headerText }
					subHeaderText={ question.subHeaderText }
					subHeaderAlign="center"
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
						onContinue={ onContinue }
					/>
					{ ! shouldHideContinueButton && (
						<Button
							className="question-step__continue-button"
							onClick={ onContinue }
							variant="primary"
							disabled={ disabled }
						>
							{ translate( 'Continue' ) }
						</Button>
					) }
				</div>
			}
			skipLabelText={ translate( 'Skip' ) }
			hideSkip={ shouldHideSkipButton }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default QuestionStep;
