import HowToReadCard from './report/how-to-read-card';
import PeerComparisonCard from './report/peer-comparison-card';
import BenchmarkStatsGrid from './report/stats-grid';
import type { AgencyBenchmark, Quarter } from '../../constants';

type Props = {
	quarter: Quarter;
	submission: AgencyBenchmark;
};

export default function BenchmarksReportState( { quarter, submission }: Props ) {
	return (
		<>
			<HowToReadCard />
			<BenchmarkStatsGrid quarter={ quarter.quarter } year={ quarter.year } />
			<PeerComparisonCard
				quarter={ quarter.quarter }
				year={ quarter.year }
				ownSubmission={ submission }
			/>
		</>
	);
}
