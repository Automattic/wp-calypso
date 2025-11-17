import { odieAssistantPerformanceProfilerQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
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
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import LLMNotice from './llm-notice';
import PerformanceInsightTable from './performance-insight-table';
import useLoadingSteps from './use-loading-steps';
import type { DeviceToggleType } from './types';
import type {
	SitePerformanceReport,
	PerformanceMetricAudit,
	PerformanceMetricAuditDetails,
} from '@automattic/api-core';
import './performance-insight.scss';

export const PerformanceInsightTitle = ( {
	insight,
	index,
	isHightImpact,
}: {
	insight: PerformanceMetricAudit;
	index: number;
	isHightImpact: boolean;
} ) => {
	const isMediumScreen = useViewportMatch( 'medium', '<' );
	const isSmallScreen = useViewportMatch( 'small', '<' );
	const intent = insight.type === 'fail' ? 'error' : 'warning';

	return (
		<HStack
			direction={ isSmallScreen ? 'column' : 'row' }
			alignment={ isSmallScreen ? 'flex-start' : 'center' }
			style={ {
				minHeight: isMediumScreen ? '40px' : 'auto',
			} }
		>
			<HStack justify="flex-start" alignment={ isMediumScreen ? 'flex-start' : 'center' }>
				<Text intent={ intent } size={ 15 } weight={ 500 } style={ { flexShrink: 0 } }>
					{ index }
				</Text>
				<HStack
					justify="flex-start"
					alignment={ isMediumScreen ? 'flex-start' : 'center' }
					direction={ isMediumScreen ? 'column' : 'row' }
				>
					<Text lineHeight={ isMediumScreen ? '17px' : 'unset' }>{ insight.title }</Text>
					{ insight.displayValue && (
						<>
							{ ! isMediumScreen && <Text>&nbsp;&minus;&nbsp;</Text> }
							<Text intent={ intent }>{ insight.displayValue }</Text>
						</>
					) }
				</HStack>
			</HStack>
			{ isHightImpact && (
				<Badge intent="error" style={ { flexShrink: 0, marginInlineStart: '16px' } }>
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
			<HStack wrap>
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
									<Button
										__next40pxDefaultSize
										variant="tertiary"
										onClick={ handleCloseFeedbackModal }
									>
										{ __( 'Cancel' ) }
									</Button>
									<Button __next40pxDefaultSize variant="primary" type="submit">
										{ __( 'Submit' ) }
									</Button>
								</ButtonStack>
							</VStack>
						</form>
					</Modal>
				) }
			</HStack>
		);
	};

	return <LLMNotice actions={ renderActions() }>{ __( 'Generated with AI' ) }</LLMNotice>;
};

const PerformanceInsightDetail = ( {
	details,
	fullPageScreenshot,
}: {
	details: PerformanceMetricAuditDetails;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
} ) => {
	if ( details.type === 'table' || details.type === 'opportunity' ) {
		return (
			<PerformanceInsightTable details={ details } fullPageScreenshot={ fullPageScreenshot } />
		);
	}

	if ( details.type === 'list' ) {
		const tables = details.items ?? [];

		return tables.map( ( item, index ) => (
			<PerformanceInsightTable
				key={ index }
				details={ item as unknown as PerformanceMetricAuditDetails }
				fullPageScreenshot={ fullPageScreenshot }
			/>
		) );
	}

	if ( details.type === 'criticalrequestchain' ) {
		// TODO: We should render the insight tree but I cannot find any sample data...
		return null;
	}

	return null;
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
	insight: PerformanceMetricAudit;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
	isWpcom: boolean;
	hash: string;
	showTip: boolean;
} ) => {
	const locale = useLocale();
	const isDesktop = useViewportMatch( 'medium' );
	const { data: llmAnswer } = useQuery( {
		...odieAssistantPerformanceProfilerQuery( {
			hash,
			insight,
			isWpcom,
			locale,
			device,
		} ),
		enabled: !! insight,
	} );

	return (
		<VStack spacing={ 4 } style={ { padding: '0 16px' } }>
			{ llmAnswer ? (
				<>
					<HStack
						alignment="flex-start"
						spacing={ 4 }
						style={ { flexWrap: isDesktop ? 'nowrap' : 'wrap-reverse' } }
					>
						<Markdown
							className="performance-insight__markdown"
							components={ {
								a( props ) {
									return <a target="_blank" { ...props } />;
								},
							} }
						>
							{ llmAnswer.messages }
						</Markdown>
						{ showTip && <PerformanceInsightTip /> }
					</HStack>
					<PerformanceInsightFeedback chatId={ llmAnswer.chatId } hash={ hash } />
					{ insight.details?.type && (
						<>
							<Spacer marginBottom={ 0 } />
							<PerformanceInsightDetail
								details={ insight.details }
								fullPageScreenshot={ fullPageScreenshot }
							/>
						</>
					) }
				</>
			) : (
				<PerformanceInsightLoading />
			) }
		</VStack>
	);
};
