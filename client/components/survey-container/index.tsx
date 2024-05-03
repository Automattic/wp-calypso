import QuestionStep from './components/question-step';
import { Answers, Question } from './types';

type SurveyContainerProps = {
	answers: Answers;
	questions: Question[];
	currentPage: number;
	onBack: () => void;
	onContinue: () => void;
	onSkip: () => void;
	onChange: ( questionKey: string, value: string[] ) => void;
	hideBackOnFirstPage?: boolean;
	disabled?: boolean;
};

const SurveyContainer = ( {
	answers,
	questions,
	currentPage,
	onBack,
	onContinue,
	onSkip,
	onChange,
	hideBackOnFirstPage = true,
	disabled,
}: SurveyContainerProps ) => {
	const currentQuestion = questions[ currentPage - 1 ];
	const hideBack = hideBackOnFirstPage && currentPage === 1;

	if ( ! currentQuestion ) {
		return null;
	}

	return (
		<QuestionStep
			question={ currentQuestion }
			value={ answers[ currentQuestion.key ] }
			onChange={ onChange }
			onBack={ onBack }
			onContinue={ onContinue }
			onSkip={ onSkip }
			disabled={ disabled }
			hideBack={ hideBack }
		/>
	);
};

export default SurveyContainer;
