import { __experimentalGrid as Grid } from '@wordpress/components';
import { PerformanceScoreCard } from './performance-score-card';
import { PerformanceScoreSummaryCard } from './performance-score-summary-card';
import { PerformanceTimesSummaryCard } from './performance-times-summary-card';

interface PerformanceScoreSectionProps {
	scores: any[];
}

export function PerformanceScoreSection( { scores }: PerformanceScoreSectionProps ) {
	return (
		<Grid columns={ 2 } templateColumns="15em 1fr">
			<Grid columns={ 1 } rows={ 2 } templateRows="6em 25em">
				<PerformanceScoreSummaryCard score={ scores.overall_score } />
				<PerformanceTimesSummaryCard
					fcp={ scores.fcp }
					lcp={ scores.lcp }
					cls={ scores.cls }
					inp={ scores.inp }
					ttfb={ scores.ttfb }
				/>
			</Grid>
			<PerformanceScoreCard scores={ scores } />
		</Grid>
	);
}
