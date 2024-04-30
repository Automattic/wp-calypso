import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { SurveyContext } from 'calypso/components/survey-container/context';
import { Answers, Question } from 'calypso/components/survey-container/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { NavigationControls } from '../../types';

type SegmentationSurveyProviderType = {
	children: React.ReactNode;
	navigation: NavigationControls;
	onSubmitQuestion: ( currentQuestion: Question ) => void;
	surveyKey: string;
	questions?: Question[];
	answers?: Answers;
};

const SegmentationSurveyProvider = ( {
	children,
	navigation,
	onSubmitQuestion,
	surveyKey,
	questions,
	answers,
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

		recordTracksEvent( 'calypso_segmentation_survey_back', {
			survey_key: surveyKey,
			question_key: currentQuestion?.key,
		} );
	}, [ currentPage, currentQuestion?.key, navigation, surveyKey ] );

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

			if ( answers?.[ currentQuestion.key ] ) {
				recordTracksEvent( 'calypso_segmentation_survey_continue', {
					survey_key: surveyKey,
					question_key: currentQuestion.key,
					answer_keys: answers?.[ currentQuestion.key ].join( ',' ) || '',
				} );
			} else {
				recordTracksEvent( 'calypso_segmentation_survey_skip', {
					survey_key: surveyKey,
					question_key: currentQuestion.key,
				} );
			}
		}

		nextPage();
	}, [ answers, currentQuestion, nextPage, onSubmitQuestion, surveyKey ] );

	const skip = useCallback( () => {
		nextPage();

		recordTracksEvent( 'calypso_segmentation_survey_skip', {
			survey_key: surveyKey,
			question_key: currentQuestion?.key,
		} );
	}, [ currentQuestion?.key, nextPage, surveyKey ] );

	return (
		<SurveyContext.Provider
			value={ {
				currentQuestion,
				currentPage,
				previousPage,
				nextPage: submitAndNextPage,
				skip,
			} }
		>
			{ children }
		</SurveyContext.Provider>
	);
};

export default SegmentationSurveyProvider;
