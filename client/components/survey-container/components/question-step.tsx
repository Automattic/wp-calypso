import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Question } from '../types';
import './style.scss';
import { QuestionComponentMap, defaultQuestionComponentMap } from './question-step-mapping';

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
	hideContinue?: boolean;
	hideSkip?: boolean;
	headerAlign?: 'center' | 'left' | 'right';
	questionComponentMap?: QuestionComponentMap;
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
	hideContinue,
	hideSkip,
	headerAlign = 'center',
	questionComponentMap = defaultQuestionComponentMap,
}: QuestionStepType ) => {
	const translate = useTranslate();
	const SelectionComponent = questionComponentMap[ question.type ];

	return (
		<StepContainer
			className={ clsx( 'question-step', { disabled } ) }
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
					{ ! hideContinue && (
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
			hideSkip={ hideSkip }
			skipLabelText={ translate( 'Skip' ) }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default QuestionStep;
