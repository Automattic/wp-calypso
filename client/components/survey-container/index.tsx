import QuestionStep from './components/question-step';
import { QuestionComponentMap } from './components/question-step-mapping';
import { Answers, Question, QuestionConfiguration } from './types';

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
	headerAlign?: 'center' | 'left' | 'right';
	questionConfiguration?: QuestionConfiguration;
	questionComponentMap?: QuestionComponentMap;
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
	headerAlign,
	questionConfiguration = {},
	questionComponentMap,
}: SurveyContainerProps ) => {
	const currentQuestion = questions[ currentPage - 1 ];
	const currentQuestionConfiguration = questionConfiguration?.[ currentQuestion.key ];
	const hideBack = hideBackOnFirstPage && currentPage === 1;

	if ( ! currentQuestion ) {
		return null;
	}

	return (
		<QuestionStep
			question={ currentQuestion }
			value={ answers[ currentQuestion.key ] || [] }
			onChange={ onChange }
			onBack={ onBack }
			onContinue={ onContinue }
			onSkip={ onSkip }
			disabled={ disabled }
			hideBack={ hideBack }
			hideContinue={ currentQuestionConfiguration?.hideContinue }
			hideSkip={ currentQuestionConfiguration?.hideSkip }
			headerAlign={ headerAlign }
			questionComponentMap={ questionComponentMap }
		/>
	);
};

export default SurveyContainer;
