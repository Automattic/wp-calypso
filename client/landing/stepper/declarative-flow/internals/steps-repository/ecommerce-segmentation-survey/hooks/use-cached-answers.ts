import { useState } from 'react';
import { Answers } from 'calypso/components/survey-container/types';

const useCachedAnswers = ( surveyKey: string ) => {
	const cacheKey = `${ surveyKey }-answers`;

	const [ answers, setAnswersState ] = useState< Answers >(
		JSON.parse( localStorage.getItem( cacheKey ) || '{}' )
	);

	return {
		answers,
		setAnswers: ( newAnswers: Answers ) => {
			setAnswersState( newAnswers );
			localStorage.setItem( cacheKey, JSON.stringify( newAnswers ) );
		},
		clearAnswers: () => {
			setAnswersState( {} );
			localStorage.removeItem( cacheKey );
		},
	};
};

export default useCachedAnswers;
