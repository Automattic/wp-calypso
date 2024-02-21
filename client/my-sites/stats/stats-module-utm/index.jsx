import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';
import { useMockData } from './useMockData';

const StatsModuleUTM = ( { period, query } ) => {
	const moduleStrings = statsStrings();

	// TODO: Use TanStack for API requests.
	const { isRequestingData, data } = useMockData();

	return (
		<StatsModuleDataQuery
			data={ data }
			path="utm"
			statType="statsUTM"
			className="stats-module-utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			summary={ false }
			isLoading={ isRequestingData }
		/>
	);
};

export default StatsModuleUTM;
