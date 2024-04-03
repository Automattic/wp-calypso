import { useQuery } from '@tanstack/react-query';
import { Survey } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

const useSegmentationSurveyQuery = () => {
	return useQuery< Survey >( {
		queryKey: [ 'segmentation-survey' ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/segmentation-survey`,
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
};

export default useSegmentationSurveyQuery;
