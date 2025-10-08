import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { thumbsUp, thumbsDown } from '@wordpress/icons';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query'; // eslint-disable-line
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import LLMNotice from './llm-notice';
import useLoadingSteps from './use-loading-steps';
import type {
	PerformanceMetricsItemQueryResponse,
	PerformanceMetricsDetailsQueryResponse,
	DeviceToggleType,
} from './types';
import type { SitePerformanceReport } from '@automattic/api-core';

export const PerformanceInsightTitle = ( {
	insight,
	index,
	isHightImpact,
}: {
	insight: PerformanceMetricsItemQueryResponse;
	index: number;
	isHightImpact: boolean;
} ) => {
	const intent = insight.type === 'fail' ? 'error' : 'warning';

	return (
		<HStack>
			<HStack justify="flex-start">
				<Text intent={ intent } size={ 15 } weight={ 500 }>
					{ index }
				</Text>
				<Text>{ insight.title }</Text>
				{ insight.displayValue && (
					<>
						<Text>&nbsp;&minus;&nbsp;</Text>
						<Text intent={ intent }>{ insight.displayValue }</Text>
					</>
				) }
			</HStack>
			{ isHightImpact && (
				<Badge intent="error" style={ { flexShrink: 0 } }>
					{ __( 'High impact' ) }
				</Badge>
			) }
		</HStack>
	);
};

const PerformanceInsightLoading = () => {
	const { steps, step } = useLoadingSteps( {
		steps: [
			__( 'Generating a personalized solution for your site using AI…' ),
			__( 'Writing instructions…' ),
			__( 'This is taking a little longer than I thought…' ),
			__( 'Stick with me…' ),
		],
	} );

	return <LLMNotice isLoading>{ steps[ step ] }</LLMNotice>;
};

const PerformanceInsightTip = () => {
	return (
		<div style={ { minWidth: '300px' } }>
			<Notice
				title={ __( 'Did you know' ) }
				actions={
					<ExternalLink href="https://wordpress.com/plugins/jetpack-boost">
						{ __( 'Get Jetpack Boost' ) }
					</ExternalLink>
				}
			>
				{ __(
					'Jetpack Boost automatically optimizes images and delivers them using a Global CDN to ensure they load lightning fast.'
				) }
			</Notice>
		</div>
	);
};

const PerformanceInsightFeedback = ( { chatId, hash }: { chatId: number; hash: string } ) => {
	const { recordTracksEvent } = useAnalytics();
	const [ isSent, setIsSent ] = useState( false );
	const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
	const [ formData, setFormData ] = useState( {
		userFeedback: '',
	} );

	const handleSubmit = ( rating: 'good' | 'bad', userFeedback?: string ) => {
		recordTracksEvent( 'calypso_dashboard_performance_profiler_llm_feedback_click', {
			chat_id: chatId,
			version: 'logged-in',
			hash,
			rating,
			...( userFeedback && { user_feedback: userFeedback } ),
		} );

		setIsSent( true );
	};

	const handleCloseFeedbackModal = () => setIsFeedbackModalOpen( false );

	const renderActions = () => {
		if ( isSent ) {
			return <Text>{ __( 'Thanks for the feedback!' ) }</Text>;
		}

		return (
			<>
				<Text>{ __( 'How did we do?' ) }</Text>
				<Button
					icon={ thumbsUp }
					iconSize={ 16 }
					size="compact"
					style={ { padding: '2px', color: 'var(--dashboard__foreground-color-success)' } }
					onClick={ () => handleSubmit( 'good' ) }
				>
					{ __( 'Good, it‘s helpful' ) }
				</Button>
				<Button
					icon={ thumbsDown }
					iconSize={ 16 }
					size="compact"
					style={ { padding: '2px', color: 'var(--dashboard__foreground-color-error)' } }
					onClick={ () => setIsFeedbackModalOpen( true ) }
				>
					{ __( 'Not helpful' ) }
				</Button>
				{ isFeedbackModalOpen && (
					<Modal
						title={ __( 'Tell us more about your experience' ) }
						size="medium"
						onRequestClose={ handleCloseFeedbackModal }
					>
						<form onSubmit={ () => handleSubmit( 'bad', formData.userFeedback ) }>
							<VStack spacing={ 6 }>
								<DataForm< { userFeedback: string } >
									data={ formData }
									fields={ [
										{
											id: 'userFeedback',
											label: __( 'Feedback' ),
											type: 'text',
											Edit: 'textarea',
										},
									] }
									form={ { layout: { type: 'regular' as const }, fields: [ 'userFeedback' ] } }
									onChange={ ( edits: Partial< { userFeedback: string } > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<ButtonStack justify="flex-end">
									<Button onClick={ handleCloseFeedbackModal }>{ __( 'Cancel' ) }</Button>
									<Button variant="primary" type="submit">
										{ __( 'Submit' ) }
									</Button>
								</ButtonStack>
							</VStack>
						</form>
					</Modal>
				) }
			</>
		);
	};

	return <LLMNotice actions={ renderActions() }>{ __( 'Generated with AI' ) }</LLMNotice>;
};

// TODO: Implement detail.
const PerformanceInsightDetail = ( {
	details,
	fullPageScreenshot,
}: {
	details: PerformanceMetricsDetailsQueryResponse;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
} ) => {
	console.log( { details, fullPageScreenshot } ); // eslint-disable-line no-console

	return <>Performance Insight Detail</>;
};

export const PerformanceInsight = ( {
	device,
	insight,
	fullPageScreenshot,
	isWpcom,
	hash,
	showTip,
}: {
	device: DeviceToggleType;
	insight: PerformanceMetricsItemQueryResponse;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
	isWpcom: boolean;
	hash: string;
	showTip: boolean;
} ) => {
	const locale = useLocale();
	const isDesktop = useViewportMatch( 'medium' );
	const { data: llmAnswer } = useSupportChatLLMQuery(
		insight,
		hash,
		isWpcom,
		true,
		locale,
		device
	);

	return (
		<VStack spacing={ 4 } style={ { padding: '0 16px' } }>
			{ llmAnswer ? (
				<>
					<HStack
						alignment="flex-start"
						spacing={ 4 }
						style={ { flexWrap: isDesktop ? 'nowrap' : 'wrap-reverse' } }
					>
						<div>
							<Markdown
								components={ {
									a( props ) {
										return <a target="_blank" { ...props } />;
									},
								} }
							>
								{ llmAnswer.messages }
							</Markdown>
						</div>
						{ showTip && <PerformanceInsightTip /> }
					</HStack>
					<PerformanceInsightFeedback chatId={ llmAnswer.chatId } hash={ hash } />
					{ insight.details?.type && (
						<PerformanceInsightDetail
							details={ insight.details }
							fullPageScreenshot={ fullPageScreenshot }
						/>
					) }
				</>
			) : (
				<PerformanceInsightLoading />
			) }
		</VStack>
	);
};
