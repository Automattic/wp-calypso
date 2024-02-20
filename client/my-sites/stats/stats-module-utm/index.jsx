import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import { useMockData } from './useMockData';

const StatsModuleUTM = ( props ) => {
	const { period, query } = props;
	const moduleStrings = statsStrings();

	// TODO: Use TanStack for API requests.
	const moduleState = useMockData();

	return (
		<StatsModule
			className="stats-module-utm"
			path="utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			statType="statsUTM"
			showSummaryLink
			moduleState={ moduleState }
		/>
	);
};

export default StatsModuleUTM;
