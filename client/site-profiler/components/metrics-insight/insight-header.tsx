import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';

interface InsightHeaderProps {
	data: PerformanceMetricsItemQueryResponse;
}

export const InsightHeader: React.FC< InsightHeaderProps > = ( props ) => {
	const { data } = props;
	const title = data.title ?? '';
	const value = data.displayValue ?? '';

	return (
		<>
			<Markdown>{ title }</Markdown>
			{ value && (
				<span>
					- <span className="value"> { value }</span>
				</span>
			) }
		</>
	);
};
