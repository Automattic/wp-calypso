import { PerformanceMetricsDetailsQueryResponse } from 'calypso/data/site-profiler/types';
import { InsightTable } from './insight-table';

export interface InsightDetailedContentProps {
	data: PerformanceMetricsDetailsQueryResponse;
}

export const InsightDetailedContent: React.FC< InsightDetailedContentProps > = ( props ) => {
	const { data } = props;

	if ( data.type === 'table' || data.type === 'opportunity' ) {
		return <InsightTable { ...props } />;
	}

	return null;
};
