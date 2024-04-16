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
	const currentPage = parseInt( window.location.hash.replace( '#', '' ), 10 ) || 1;
	const currentQuestion = questions?.[ currentPage - 1 ];

	const previousPage = () => {
		if ( currentPage === 1 ) {
			navigation.goBack?.();
			return;
		}

		window.location.hash = `${ currentPage - 1 }`;
	};

	const nextPage = ( skip: boolean ) => {
		if ( ! skip && currentQuestion ) {
			onSubmitQuestion( currentQuestion );
		}

		if ( currentPage === questions?.length ) {
			navigation.submit?.();
			return;
		}

		window.location.hash = `${ currentPage + 1 }`;
	};

	return (
		<SurveyContext.Provider
			value={ {
				currentQuestion,
				currentPage,
				previousPage,
				nextPage: () => nextPage( false ),
				skip: () => nextPage( true ),
			} }
		>
			{ children }
		</SurveyContext.Provider>
	);
};

export default SegmentationSurveyProvider;
