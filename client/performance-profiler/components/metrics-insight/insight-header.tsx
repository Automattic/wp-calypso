import { isMobile } from '@automattic/viewport';
import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';

interface InsightHeaderProps {
	data: PerformanceMetricsItemQueryResponse;
	index: number;
}

export const InsightHeader: React.FC< InsightHeaderProps > = ( props ) => {
	const { data, index } = props;
	const title = data.title ?? '';
	const value = data.displayValue ?? '';

	return (
		<>
			<span className="counter" style={ { color: data.type === 'fail' ? 'red' : 'orange' } }>
				{ index + 1 }
			</span>
			<Markdown
				components={ {
					p( props ) {
						return <p className="title-description">{ props.children }</p>;
					},
					code( props ) {
						return (
							<span
								className="value"
								style={ { color: props.data.type === 'fail' ? 'red' : 'orange' } }
							>
								{ props.children }
							</span>
						);
					},
				} }
			>
				{ title }
			</Markdown>
			{ value && isMobile() && <span className="value is-mobile"> { value }</span> }
			{ value && ! isMobile() && (
				<span>
					&nbsp;&minus;&nbsp;
					<span className="value" style={ { color: data.type === 'fail' ? 'red' : 'orange' } }>
						{ ' ' }
						{ value }
					</span>
				</span>
			) }
		</>
	);
};
