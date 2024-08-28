import { useTranslate } from 'i18n-calypso';
import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { InsightDetailedContent } from './insight-detailed-content';

interface InsightContentProps {
	data: PerformanceMetricsItemQueryResponse;
	isLoading?: boolean;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const translate = useTranslate();
	const { data, isLoading } = props;
	const { description = '' } = data ?? {};

	return (
		<div className="metrics-insight-content">
			{ isLoading ? (
				translate( 'Looking for the best solution…' )
			) : (
				<>
					<Markdown
						components={ {
							a( props ) {
								return <a target="_blank" { ...props } />;
							},
						} }
					>
						{ description }
					</Markdown>
					{ data.details?.type && (
						<div className="metrics-insight-detailed-content">
							<InsightDetailedContent data={ data.details } />
						</div>
					) }
				</>
			) }
		</div>
	);
};
