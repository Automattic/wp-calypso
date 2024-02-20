import statsStrings from '../stats-strings';
import StatsModule2 from './stats-module';
import { useMockData } from './useMockData';

const StatsModuleUTM = ( props ) => {
	const { period, query, summary = false } = props;
	const moduleStrings = statsStrings();

	// TODO: Use TanStack for API requests.
	const moduleState = useMockData();

	return (
		<StatsModule2
			className="stats-module-utm"
			path="utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			statType="statsUTM"
			showSummaryLink
			moduleState={ moduleState }
			summary={ summary }
		/>
	);
};

export default StatsModuleUTM;
