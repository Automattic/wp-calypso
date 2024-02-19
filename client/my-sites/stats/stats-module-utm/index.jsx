import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( props ) => {
	const { period, query } = props;
	const moduleStrings = statsStrings();

	return (
		<StatsModule
			path="utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			statType="statsTopAuthors"
			showSummaryLink
		/>
	);
};

export default StatsModuleUTM;
