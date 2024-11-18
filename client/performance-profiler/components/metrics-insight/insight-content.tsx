import { Button, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Markdown from 'react-markdown';
import {
	FullPageScreenshot,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { LLMMessage } from 'calypso/performance-profiler/components/llm-message';
import { ThumbsUpIcon, ThumbsDownIcon } from 'calypso/performance-profiler/icons/thumbs';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { InsightDetailedContent } from './insight-detailed-content';

interface InsightContentProps {
	fullPageScreenshot: FullPageScreenshot;
	data: PerformanceMetricsItemQueryResponse;
	secondaryArea?: React.ReactNode;
	isLoading?: boolean;
	AIGenerated: boolean;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const translate = useTranslate();
	const { data, fullPageScreenshot, isLoading, AIGenerated } = props;
	const { description = '' } = data ?? {};
	const [ feedbackSent, setFeedbackSent ] = useState( false );
	const [ feedbackOpen, setFeedbackOpen ] = useState( false );
	const [ userFeedback, setUserFeedback ] = useState( '' );
	const onSurveyClick = ( rating: string ) => {
		recordTracksEvent( 'calypso_performance_profiler_llm_survey_click', {
			rating,
			description,
			...( userFeedback && { user_feedback: userFeedback } ),
			version: profilerVersion(),
		} );

		setFeedbackSent( true );
	};

	const renderFeedbackForm = () => {
		if ( feedbackSent ) {
			return <div className="survey">{ translate( 'Thanks for the feedback!' ) }</div>;
		}

		if ( feedbackOpen ) {
			return (
				<div className="survey wrapped">
					<div className="survey-form">
						<div>
							{ translate( 'Thanks for the feedback! Tell us more about your experience' ) }
						</div>
						<TextareaControl
							className="feedback-textarea"
							__nextHasNoMarginBottom
							rows={ 4 }
							onChange={ ( value ) => setUserFeedback( value ) }
							value={ userFeedback }
						/>
						<Button variant="primary" onClick={ () => onSurveyClick( 'bad' ) }>
							{ translate( 'Send feedback' ) }
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="survey">
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
					onClick={ () => setFeedbackOpen( true ) }
					onKeyUp={ () => setFeedbackOpen( true ) }
					role="button"
					tabIndex={ 0 }
				>
					<ThumbsDownIcon />
					{ translate( 'Not helpful' ) }
				</div>
			</div>
		);
	};

	return (
		<div className="metrics-insight-content">
			{ isLoading ? (
				<LLMMessage message={ translate( 'Finding the best solution for your page' ) } rotate />
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
							secondaryArea={ renderFeedbackForm() }
						/>
					) }

					{ data.details?.type && (
						<div className="metrics-insight-detailed-content">
							<InsightDetailedContent
								fullPageScreenshot={ fullPageScreenshot }
								data={ data.details }
							/>
						</div>
					) }
				</>
			) }
		</div>
	);
};
