import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';
import { useMockData } from './useMockData';

const StatsModuleUTM = ( { period, postId, query } ) => {
	const moduleStrings = statsStrings();

	// TODO: Use TanStack for API requests.
	const { isRequestingData, data } = useMockData( postId );

	// TODO: Hide summary link on summary page too.
	const hideSummaryLink = postId !== undefined;

	return (
		<StatsModuleDataQuery
			data={ data }
			path="utm"
			statType="statsUTM"
			className="stats-module-utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			isLoading={ isRequestingData }
			hideSummaryLink={ hideSummaryLink }
		/>
	);
};

export default StatsModuleUTM;
