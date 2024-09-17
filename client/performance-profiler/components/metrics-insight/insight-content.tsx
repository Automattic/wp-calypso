import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { LLMMessage } from 'calypso/performance-profiler/components/llm-message';
import { ThumbsUpIcon, ThumbsDownIcon } from 'calypso/performance-profiler/icons/thumbs';
import { InsightDetailedContent } from './insight-detailed-content';

interface InsightContentProps {
	data: PerformanceMetricsItemQueryResponse;
	secondaryArea?: React.ReactNode;
	isLoading?: boolean;
	AIGenerated: boolean;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const translate = useTranslate();
	const { data, isLoading, AIGenerated } = props;
	const { description = '' } = data ?? {};
	const [ feedbackSent, setFeedbackSent ] = useState( false );
	const onSurveyClick = ( rating: string ) => {
		recordTracksEvent( 'calypso_performance_profiler_llm_survey_click', {
			rating,
			description,
		} );

		setFeedbackSent( true );
	};

	return (
		<div className="metrics-insight-content">
			{ isLoading ? (
				<LLMMessage message={ translate( 'Finding the best solution for your site…' ) } rotate />
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

					{ AIGenerated && (
						<LLMMessage
							message={
								<span className="generated-with-ai">{ translate( 'Generated with AI' ) }</span>
							}
							secondaryArea={
								<div className="survey">
									{ feedbackSent ? (
										translate( 'Thanks for the feedback!' )
									) : (
										<>
											<span>{ translate( 'How did we do?' ) }</span>
											<div
												className="options good"
												onClick={ () => onSurveyClick( 'good' ) }
												onKeyUp={ () => onSurveyClick( 'good' ) }
												role="button"
												tabIndex={ 0 }
											>
												<ThumbsUpIcon />

												{ translate( 'Good, it‘s helpful' ) }
											</div>
											<div
												className="options bad"
												onClick={ () => onSurveyClick( 'bad' ) }
												onKeyUp={ () => onSurveyClick( 'bad' ) }
												role="button"
												tabIndex={ 0 }
											>
												<ThumbsDownIcon />
												{ translate( 'Not helpful' ) }
											</div>
										</>
									) }
								</div>
							}
						/>
					) }

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
