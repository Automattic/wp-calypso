import QuestionStep from './components/question-step';
import { useSurveyContext } from './context';
import { Answers, Question } from './types';

type SurveyContainerType = {
	questions: Question[];
	answers: Answers;
	onChange: ( questionKey: string, value: string[] ) => void;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

const SurveyContainer = ( {
	questions,
	answers,
	onChange,
	recordTracksEvent,
}: SurveyContainerType ) => {
	const { currentPage, nextPage, previousPage, skip } = useSurveyContext();
	const currentQuestion = questions[ currentPage - 1 ];

	if ( ! currentQuestion ) {
		return null;
	}

	return (
		<QuestionStep
			previousPage={ previousPage }
			nextPage={ nextPage }
			skip={ skip }
			recordTracksEvent={ recordTracksEvent }
			onChange={ onChange }
			question={ currentQuestion }
			value={ answers[ currentQuestion.key ] || [] }
		/>
	);
};

export default SurveyContainer;
