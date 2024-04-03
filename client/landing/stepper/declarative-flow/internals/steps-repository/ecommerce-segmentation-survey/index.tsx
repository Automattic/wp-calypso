import config from '@automattic/calypso-config';
import SurveyContainer from 'calypso/components/survey-container';
import { mockQuestions } from './mock';
import EcommerceSegmentationSurveyProvider from './provider';
import './style.scss';
import type { Step } from '../../types';

const EcommerceSegmentationSurvey: Step = ( { navigation } ) => {
	const recordTracksEvent = () => {};

	if ( ! config.isEnabled( 'ecommerce-segmentation-survey' ) ) {
		return null;
	}

	return (
		<EcommerceSegmentationSurveyProvider
			navigation={ navigation }
			totalPages={ mockQuestions.length }
		>
			<SurveyContainer questions={ mockQuestions } recordTracksEvent={ recordTracksEvent } />
		</EcommerceSegmentationSurveyProvider>
	);
};

export default EcommerceSegmentationSurvey;
