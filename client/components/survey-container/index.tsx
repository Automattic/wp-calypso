import QuestionStep from './components/question-step';
import { useSurveyContext } from './context';
import { Answers } from './types';

type SurveyContainerType = {
	answers: Answers;
	hideBackOnFirstPage?: boolean;
	onChange: ( questionKey: string, value: string[] ) => void;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

const SurveyContainer = ( {
	answers,
	hideBackOnFirstPage = true,
	onChange,
	recordTracksEvent,
}: SurveyContainerType ) => {
	const { currentPage, currentQuestion, nextPage, previousPage, skip } = useSurveyContext();
	const hideBack = hideBackOnFirstPage && currentPage === 1;

	if ( ! currentQuestion ) {
		return null;
	}

	return (
		<QuestionStep
			hideBack={ hideBack }
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
