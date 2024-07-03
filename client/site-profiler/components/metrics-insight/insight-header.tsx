import { isMobile } from '@automattic/viewport';
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
			<Markdown
				components={ {
					code( props ) {
						return <span className="value">{ props.children }</span>;
					},
				} }
			>
				{ title }
			</Markdown>
			{ value && isMobile() && <span className="value is-mobile"> { value }</span> }
			{ value && ! isMobile() && (
				<span>
					&nbsp;&minus;&nbsp;<span className="value"> { value }</span>
				</span>
			) }
		</>
	);
};
