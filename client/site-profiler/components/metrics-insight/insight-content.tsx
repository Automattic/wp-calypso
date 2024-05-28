import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';

interface InsightContentProps {
	data: PerformanceMetricsItemQueryResponse;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const { data } = props;
	const { description = '' } = data ?? {};

	return (
		<div className="metrics-insigh-content">
			<Markdown>{ description }</Markdown>
		</div>
	);
};
