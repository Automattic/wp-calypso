import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { highImpactAudits } from 'calypso/performance-profiler/utils/metrics';

interface InsightHeaderProps {
	data: PerformanceMetricsItemQueryResponse;
	index: number;
}
export const InsightHeader: React.FC< InsightHeaderProps > = ( props ) => {
	const isMobile = ! useDesktopBreakpoint();
	const { data, index } = props;
	const title = data.title ?? '';
	const value = data.displayValue ?? '';
	const { id, type } = data;

	const renderBadge = () => {
		if ( ! highImpactAudits.includes( id ) ) {
			return null;
		}

		return (
			<span className={ clsx( 'impact fail', { 'is-mobile': isMobile } ) }>
				{ __( 'High Impact' ) }
			</span>
		);
	};

	return (
		<div className="insight-header-container">
			<span className={ clsx( 'counter', { [ type ]: true } ) }>{ index + 1 }</span>
			<div>
				<Markdown
					components={ {
						p( props ) {
							return <p className="title-description">{ props.children }</p>;
						},
						code( props ) {
							return <span className="md-code">{ props.children }</span>;
						},
					} }
				>
					{ title }
				</Markdown>
				{ value && isMobile && (
					<span className={ clsx( 'value is-mobile', { [ type ]: true } ) }> { value }</span>
				) }
				{ value && ! isMobile && (
					<span>
						&nbsp;&minus;&nbsp;
						<span className={ clsx( 'value', { [ type ]: true } ) }> { value }</span>
					</span>
				) }
				{ renderBadge() }
			</div>
		</div>
	);
};
