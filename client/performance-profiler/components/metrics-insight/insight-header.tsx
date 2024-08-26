import { isMobile } from '@automattic/viewport';
import clsx from 'clsx';
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
	const { type } = data;

	return (
		<>
			<span className={ clsx( 'counter', { [ type ]: true } ) }>{ index + 1 }</span>
			<Markdown
				components={ {
					p( props ) {
						return <p className="title-description">{ props.children }</p>;
					},
					code( props ) {
						return <span className="value">{ props.children }</span>;
					},
				} }
			>
				{ title }
			</Markdown>
			{ value && isMobile() && (
				<span className={ clsx( 'value is-mobile', { [ type ]: true } ) }> { value }</span>
			) }
			{ value && ! isMobile() && (
				<span>
					&nbsp;&minus;&nbsp;
					<span className={ clsx( 'value', { [ type ]: true } ) }> { value }</span>
				</span>
			) }
		</>
	);
};
