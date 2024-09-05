import { useTranslate } from 'i18n-calypso';
import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { LLMMessage } from 'calypso/performance-profiler/components/llm-message';
import { InsightDetailedContent } from './insight-detailed-content';

interface InsightContentProps {
	data: PerformanceMetricsItemQueryResponse;
	secondaryArea?: React.ReactNode;
	isLoading?: boolean;
	IAGenerated: boolean;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const translate = useTranslate();
	const { data, isLoading, IAGenerated } = props;
	const { description = '' } = data ?? {};

	return (
		<div className="metrics-insight-content">
			{ isLoading ? (
				<LLMMessage message={ translate( 'Finding the best solution…' ) } rotate />
			) : (
				<>
					<div className="description-area">
						<div className="content">
							<Markdown
								components={ {
									a( props ) {
										return <a target="_blank" { ...props } />;
									},
								} }
							>
								{ description }
							</Markdown>
						</div>
						{ props.secondaryArea }
					</div>

					{ IAGenerated && <LLMMessage message={ translate( 'Generated with IA' ) } /> }

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
