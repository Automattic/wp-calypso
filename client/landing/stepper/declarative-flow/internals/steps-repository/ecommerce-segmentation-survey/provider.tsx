import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { SurveyContext } from 'calypso/components/survey-container/context';
import type { NavigationControls } from '../../types';

const PAGE_QUERY_PARAM = 'page';

const updatePath = ( newPage: number ) =>
	addQueryArgs( page.current, { [ PAGE_QUERY_PARAM ]: newPage } );

type EcommerceSegmentationSurveyProviderType = {
	children: React.ReactNode;
	navigation: NavigationControls;
	onSubmitQuestion: ( currentPage: number, skip: boolean ) => void;
	totalPages: number;
};

const EcommerceSegmentationSurveyProvider = ( {
	children,
	navigation,
	onSubmitQuestion,
	totalPages,
}: EcommerceSegmentationSurveyProviderType ) => {
	const searchParams = new URLSearchParams( page.current.split( '?' )[ 1 ] );
	const currentPage = parseInt( searchParams.get( PAGE_QUERY_PARAM ) || '1', 10 );

	const previousPage = () => {
		if ( currentPage === 1 ) {
			navigation.goBack?.();
			return;
		}

		page.show( updatePath( currentPage - 1 ) );
	};

	const nextPage = ( skip: boolean = false ) => {
		onSubmitQuestion( currentPage, skip );

		if ( currentPage === totalPages ) {
			navigation.submit?.();
			return;
		}

		page.show( updatePath( currentPage + 1 ) );
	};

	return (
		<SurveyContext.Provider
			value={ { currentPage, previousPage, nextPage, skip: () => nextPage( true ) } }
		>
			{ children }
		</SurveyContext.Provider>
	);
};

export default EcommerceSegmentationSurveyProvider;
