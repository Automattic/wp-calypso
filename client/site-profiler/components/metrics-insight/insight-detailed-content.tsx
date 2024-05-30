import { AdvancedMetricsDetailsQueryResponse } from 'calypso/data/site-profiler/types';
import { InsightTable } from './insight-table';

export interface InsightDetailedContentProps {
	data: AdvancedMetricsDetailsQueryResponse;
}

export const InsightDetailedContent: React.FC< InsightDetailedContentProps > = ( props ) => {
	const { data } = props;

	if ( data.type === 'table' || data.type === 'opportunity' ) {
		return <InsightTable { ...props } />;
	}

	if ( data.type === 'list' ) {
		const tables = data.items ?? [];

		return tables.map( ( item, index ) => <InsightTable key={ index } data={ item as any } /> );
	}

	return null;
};
