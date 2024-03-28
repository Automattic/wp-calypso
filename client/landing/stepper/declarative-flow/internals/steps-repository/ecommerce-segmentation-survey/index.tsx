import config from '@automattic/calypso-config';
import PaginatedSurvey from 'calypso/components/paginated-survey';
import EcommerceSegmentationSurveyProvider from './provider';
import { questions } from './questions';
import './style.scss';
import type { Step } from '../../types';

const EcommerceSegmentationSurvey: Step = ( { navigation } ) => {
	const recordTracksEvent = () => {};

	if ( ! config.isEnabled( 'ecommerce-segmentation-survey' ) ) {
		return null;
	}

	return (
		<EcommerceSegmentationSurveyProvider navigation={ navigation } totalPages={ questions.length }>
			<PaginatedSurvey questions={ questions } recordTracksEvent={ recordTracksEvent } />
		</EcommerceSegmentationSurveyProvider>
	);
};

export default EcommerceSegmentationSurvey;
