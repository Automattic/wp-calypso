import {
	FullPageScreenshot,
	PerformanceMetricsDetailsQueryResponse,
} from 'calypso/data/site-profiler/types';
import { InsightTable } from './insight-table';
import { InsightTree } from './insight-tree';

export interface InsightDetailedContentProps {
	data: PerformanceMetricsDetailsQueryResponse;
	fullPageScreenshot: FullPageScreenshot;
}

export const InsightDetailedContent: React.FC< InsightDetailedContentProps > = ( props ) => {
	const { data, fullPageScreenshot } = props;

	if ( data.type === 'table' || data.type === 'opportunity' ) {
		return <InsightTable { ...props } />;
	}

	if ( data.type === 'list' ) {
		const tables = data.items ?? [];

		return tables.map( ( item, index ) => (
			<InsightTable key={ index } fullPageScreenshot={ fullPageScreenshot } data={ item as any } />
		) );
	}

	if ( data.type === 'criticalrequestchain' ) {
		return <InsightTree { ...props } />;
	}

	return null;
};
