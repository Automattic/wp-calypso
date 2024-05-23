import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Question } from '../types';
import getQuestionStepProps from './hooks/get-question-step-props';
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
	headerAlign?: string;
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
	headerAlign = 'center',
}: QuestionStepType ) => {
	const translate = useTranslate();
	const flowPath = window.location.pathname;
	const { questionTypeComponentMapping, shouldHideContinueButton, shouldHideSkipButton } =
		getQuestionStepProps( question, flowPath );

	const SelectionComponent = questionTypeComponentMapping[ question.type ];

	return (
		<StepContainer
			className={ classNames( 'question-step', { disabled } ) }
			hideBack={ hideBack }
			goBack={ onBack }
			goNext={ onSkip }
			formattedHeader={
				<FormattedHeader
					align={ headerAlign }
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
			hideSkip={ shouldHideSkipButton }
			skipLabelText={ translate( 'Skip' ) }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default QuestionStep;
