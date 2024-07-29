import { useCallback, useState } from 'react';
import { Answers } from 'calypso/components/survey-container/types';

const useCachedAnswers = ( surveyKey: string ) => {
	const cacheKey = `${ surveyKey }-answers`;

	const [ answers, setAnswersState ] = useState< Answers >(
		JSON.parse( localStorage.getItem( cacheKey ) || '{}' )
	);

	const setAnswers = useCallback(
		( newAnswers: Answers ) => {
			setAnswersState( newAnswers );
			localStorage.setItem( cacheKey, JSON.stringify( newAnswers ) );
		},
		[ cacheKey ]
	);

	const clearAnswers = useCallback( () => {
		setAnswersState( {} );
		localStorage.removeItem( cacheKey );
	}, [ cacheKey ] );

	return {
		answers,
		setAnswers,
		clearAnswers,
	};
};

export default useCachedAnswers;
