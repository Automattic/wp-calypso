import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { SurveyContext } from 'calypso/components/survey-container/context';
import { Question } from 'calypso/components/survey-container/types';
import type { NavigationControls } from '../../types';

type SegmentationSurveyProviderType = {
	children: React.ReactNode;
	navigation: NavigationControls;
	onSubmitQuestion: ( currentQuestion: Question ) => void;
	questions?: Question[];
};

const SegmentationSurveyProvider = ( {
	children,
	navigation,
	onSubmitQuestion,
	questions,
}: SegmentationSurveyProviderType ) => {
	const { hash } = useLocation();
	const currentPage = useMemo( () => parseInt( hash.replace( '#', '' ), 10 ) || 1, [ hash ] );

	const currentQuestion = useMemo(
		() => questions?.[ currentPage - 1 ],
		[ currentPage, questions ]
	);

	const previousPage = useCallback( () => {
		if ( currentPage === 1 ) {
			navigation.goBack?.();
			return;
		}

		window.location.hash = `${ currentPage - 1 }`;
	}, [ currentPage, navigation ] );

	const nextPage = useCallback( () => {
		if ( currentPage === questions?.length ) {
			navigation.submit?.();
			return;
		}

		window.location.hash = `${ currentPage + 1 }`;
	}, [ currentPage, navigation, questions?.length ] );

	const submitAndNextPage = useCallback( () => {
		if ( currentQuestion ) {
			onSubmitQuestion( currentQuestion );
		}
		nextPage();
	}, [ currentQuestion, nextPage, onSubmitQuestion ] );

	return (
		<SurveyContext.Provider
			value={ {
				currentQuestion,
				currentPage,
				previousPage,
				nextPage: submitAndNextPage,
				skip: nextPage,
			} }
		>
			{ children }
		</SurveyContext.Provider>
	);
};

export default SegmentationSurveyProvider;
