import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { PaginatedSurveyContext } from 'calypso/components/survey-container/context';
import type { NavigationControls } from '../../types';

const PAGE_QUERY_PARAM = 'page';

type EcommerceSegmentationSurveyProviderType = {
	children: React.ReactNode;
	navigation: NavigationControls;
	totalPages: number;
};

const EcommerceSegmentationSurveyProvider = ( {
	children,
	navigation,
	totalPages,
}: EcommerceSegmentationSurveyProviderType ) => {
	const searchParams = new URLSearchParams( page.current.split( '?' )[ 1 ] );
	const currentPage = parseInt( searchParams.get( PAGE_QUERY_PARAM ) || '1', 10 );

	const previousPage = () => {
		if ( currentPage === 1 ) {
			navigation.goBack?.();
			return;
		}

		const updatedPath = addQueryArgs( page.current, { [ PAGE_QUERY_PARAM ]: currentPage - 1 } );
		page.show( updatedPath );
	};

	const nextPage = () => {
		if ( currentPage === totalPages ) {
			navigation.submit?.();
			return;
		}

		const updatedPath = addQueryArgs( page.current, { [ PAGE_QUERY_PARAM ]: currentPage + 1 } );
		page.show( updatedPath );
	};

	return (
		<PaginatedSurveyContext.Provider value={ { currentPage, previousPage, nextPage } }>
			{ children }
		</PaginatedSurveyContext.Provider>
	);
};

export default EcommerceSegmentationSurveyProvider;
