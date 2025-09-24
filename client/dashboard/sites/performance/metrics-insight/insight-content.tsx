import { Button, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
	isFetched?: boolean;
	isWpscanLoading?: boolean;
	AIGenerated: boolean;
	hash: string;
	url?: string;
	chatId?: number;
}

export const InsightContent: React.FC< InsightContentProps > = ( props ) => {
	const {
		data,
		fullPageScreenshot,
		isLoading,
		isFetched = false,
		isWpscanLoading,
		AIGenerated,
		hash,
		url,
		chatId,
	} = props;
	const { description = '' } = data ?? {};
	const [ feedbackSent, setFeedbackSent ] = useState( false );
	const [ feedbackOpen, setFeedbackOpen ] = useState( false );
	const [ userFeedback, setUserFeedback ] = useState( '' );
	const [ messageIndex, setMessageIndex ] = useState( 0 );
	const messageTimer = useRef< ReturnType< typeof setTimeout > | null >( null );

	const messages = useMemo(
		() => [
			{
				message: __( 'Generating a personalized solution for your site using AI…' ),
				nextTimer: 3000,
			},
			{ message: __( 'Writing instructions…' ), nextTimer: 3000 },
			{ message: __( 'This is taking a little longer than I thought…' ), nextTimer: 4000 },
			{ message: __( 'Stick with me…' ), nextTimer: null },
		],
		[]
	);

	/**
	 * Updates the current message index and schedules the next message in the sequence.
	 * It is used for rotating display message, while insights are fetched from the API.
	 * Only schedules the next timer if loading is still active and there are more messages.
	 * @param currentIndex - The index of the message to display
	 */
	const updateMessageIndex = useCallback(
		( currentIndex: number ) => {
			setMessageIndex( currentIndex );
			const currentMessage = messages[ currentIndex ];
			if ( currentMessage.nextTimer && currentIndex < messages.length - 1 && isLoading ) {
				messageTimer.current = setTimeout( () => {
					updateMessageIndex( currentIndex + 1 );
				}, currentMessage.nextTimer );
			}
		},
		[ isLoading, messages ]
	);

	useEffect( () => {
		if ( isLoading && ! messageTimer.current ) {
			updateMessageIndex( 0 );
		}
		return () => {
			if ( messageTimer.current ) {
				clearTimeout( messageTimer.current );
				messageTimer.current = null;
			}
		};
	}, [ isLoading, updateMessageIndex ] );

	const onSurveyClick = ( rating: string ) => {
		recordTracksEvent( 'calypso_performance_profiler_llm_survey_click', {
			hash,
			url,
			chat_id: chatId,
			rating,
			...( userFeedback && { user_feedback: userFeedback } ),
			version: profilerVersion(),
		} );

		setFeedbackSent( true );
	};

	const renderFeedbackForm = () => {
		if ( feedbackSent ) {
			return <div className="survey">{ __( 'Thanks for the feedback!' ) }</div>;
		}

		if ( feedbackOpen ) {
			return (
				<div className="survey wrapped">
					<div className="survey-form">
						<div>{ __( 'Thanks for the feedback! Tell us more about your experience' ) }</div>
						<TextareaControl
							className="feedback-textarea"
							__nextHasNoMarginBottom
							rows={ 4 }
							onChange={ ( value ) => setUserFeedback( value ) }
							value={ userFeedback }
						/>
						<Button variant="primary" onClick={ () => onSurveyClick( 'bad' ) }>
							{ __( 'Send feedback' ) }
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="survey">
				<span>{ __( 'How did we do?' ) }</span>
				<div
					className="options good"
					onClick={ () => onSurveyClick( 'good' ) }
					onKeyUp={ () => onSurveyClick( 'good' ) }
					role="button"
					tabIndex={ 0 }
				>
					<ThumbsUpIcon />

					{ __( 'Good, it‘s helpful' ) }
				</div>
				<div
					className="options bad"
					onClick={ () => setFeedbackOpen( true ) }
					onKeyUp={ () => setFeedbackOpen( true ) }
					role="button"
					tabIndex={ 0 }
				>
					<ThumbsDownIcon />
					{ __( 'Not helpful' ) }
				</div>
			</div>
		);
	};

	const renderLoadingMessage = () => {
		if ( isWpscanLoading ) {
			return (
				<LLMMessage
					message={ __(
						"We're still checking some details of your site to make the best possible recommendations."
					) }
					rotate
				/>
			);
		}
		return <LLMMessage message={ messages[ messageIndex ].message } rotate />;
	};

	return (
		<div className="metrics-insight-content">
			{ isLoading || isWpscanLoading || ! isFetched ? (
				renderLoadingMessage()
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
							message={ <span className="generated-with-ai">{ __( 'Generated with AI' ) }</span> }
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
