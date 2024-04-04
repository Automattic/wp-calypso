import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { SurveyContext } from 'calypso/components/survey-container/context';
import { Question } from 'calypso/components/survey-container/types';
import type { NavigationControls } from '../../types';

const PAGE_QUERY_PARAM = 'page';

const updatePath = ( newPage: number ) =>
	addQueryArgs( page.current, { [ PAGE_QUERY_PARAM ]: newPage } );

type EcommerceSegmentationSurveyProviderType = {
	children: React.ReactNode;
	navigation: NavigationControls;
	onSubmitQuestion: ( currentQuestion: Question, skip: boolean ) => void;
	questions: Question[];
};

const EcommerceSegmentationSurveyProvider = ( {
	children,
	navigation,
	onSubmitQuestion,
	questions,
}: EcommerceSegmentationSurveyProviderType ) => {
	const searchParams = new URLSearchParams( page.current.split( '?' )[ 1 ] );
	const currentPage = parseInt( searchParams.get( PAGE_QUERY_PARAM ) || '1', 10 );
	const currentQuestion = questions[ currentPage - 1 ];

	const previousPage = () => {
		if ( currentPage === 1 ) {
			navigation.goBack?.();
			return;
		}

		page.show( updatePath( currentPage - 1 ) );
	};

	const nextPage = ( skip: boolean = false ) => {
		onSubmitQuestion( currentQuestion, skip );

		if ( currentPage === questions.length ) {
			navigation.submit?.();
			return;
		}

		page.show( updatePath( currentPage + 1 ) );
	};

	return (
		<SurveyContext.Provider
			value={ {
				currentQuestion,
				currentPage,
				previousPage,
				nextPage,
				skip: () => nextPage( true ),
			} }
		>
			{ children }
		</SurveyContext.Provider>
	);
};

export default EcommerceSegmentationSurveyProvider;
