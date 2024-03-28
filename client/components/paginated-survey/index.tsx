import { useState } from 'react';
import QuestionStep from './components/question-step';
import { usePaginatedSurveyContext } from './context';
import { Question } from './types';

type PaginatedSurveyType = {
	questions: Question[];
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

const PaginatedSurvey = ( { questions, recordTracksEvent }: PaginatedSurveyType ) => {
	const { currentPage, nextPage, previousPage } = usePaginatedSurveyContext();
	const [ answers, setAnswers ] = useState( {} ); // State management TBD

	const onChangeAnswer = ( questionKey: string, value: string[] ) => {
		setAnswers( { ...answers, [ questionKey ]: value } );
	};

	const currentQuestion = questions[ currentPage - 1 ];

	return (
		<QuestionStep
			previousPage={ previousPage }
			nextPage={ nextPage }
			skip={ nextPage }
			recordTracksEvent={ recordTracksEvent }
			onChange={ onChangeAnswer }
			question={ currentQuestion }
		/>
	);
};

export default PaginatedSurvey;
