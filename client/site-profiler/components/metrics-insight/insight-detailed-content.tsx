import { InsightTable } from './insight-table';
import { InsightTree } from './insight-tree';
import type { PerformanceMetricAuditDetails } from '@automattic/api-core';

export interface InsightDetailedContentProps {
	data: PerformanceMetricAuditDetails;
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

	if ( data.type === 'criticalrequestchain' ) {
		return <InsightTree { ...props } />;
	}

	return null;
};
