import { useState } from 'react';
import QuestionStep from './components/question-step';
import { usePaginatedSurveyContext } from './context';
import { Answers, Question } from './types';

type PaginatedSurveyType = {
	questions: Question[];
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

const SurveyContainer = ( { questions, recordTracksEvent }: PaginatedSurveyType ) => {
	const { currentPage, nextPage, previousPage } = usePaginatedSurveyContext();
	const currentQuestion = questions[ currentPage - 1 ];

	const [ answers, setAnswers ] = useState< Answers >( {
		[ currentQuestion.key ]: [],
	} );

	const onChangeAnswer = ( questionKey: string, value: string[] ) => {
		setAnswers( { ...answers, [ questionKey ]: value } );
	};

	return (
		<QuestionStep
			previousPage={ previousPage }
			nextPage={ nextPage }
			skip={ nextPage }
			recordTracksEvent={ recordTracksEvent }
			onChange={ onChangeAnswer }
			question={ currentQuestion }
			value={ answers[ currentQuestion.key ] }
		/>
	);
};

export default SurveyContainer;
