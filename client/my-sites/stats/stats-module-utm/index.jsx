import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( props ) => {
	// ToDo: Add typing/testing of period & query props.
	// Currently accepts undefined without issue.
	const { period, query } = props;
	const moduleStrings = statsStrings();

	return (
		<StatsModule
			path="utm"
			moduleStrings={ moduleStrings.authors }
			period={ period }
			query={ query }
			statType="statsTopAuthors"
			showSummaryLink
		/>
	);
};

export default StatsModuleUTM;
