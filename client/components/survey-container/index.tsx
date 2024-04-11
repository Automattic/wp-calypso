import QuestionStep from './components/question-step';
import { useSurveyContext } from './context';
import { Answers } from './types';

type SurveyContainerType = {
	answers: Answers;
	onChange: ( questionKey: string, value: string[] ) => void;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

const SurveyContainer = ( { answers, onChange, recordTracksEvent }: SurveyContainerType ) => {
	const { currentQuestion, nextPage, previousPage, skip } = useSurveyContext();

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
