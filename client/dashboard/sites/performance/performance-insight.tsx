import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { thumbsUp, thumbsDown } from '@wordpress/icons';
import Markdown from 'react-markdown';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query'; // eslint-disable-line
import { useLocale } from '../../app/locale';
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

// TODO: Implement click behavior.
const PerformanceInsightFeedback = () => {
	return (
		<LLMNotice
			actions={
				<>
					<Text>{ __( 'How did we do?' ) }</Text>
					<Button
						icon={ thumbsUp }
						iconSize={ 16 }
						size="compact"
						style={ { padding: '2px', color: 'var(--dashboard__foreground-color-success)' } }
					>
						{ __( 'Good, it‘s helpful' ) }
					</Button>
					<Button
						icon={ thumbsDown }
						iconSize={ 16 }
						size="compact"
						style={ { padding: '2px', color: 'var(--dashboard__foreground-color-error)' } }
					>
						{ __( 'Not helpful' ) }
					</Button>
				</>
			}
		>
			{ __( 'Generated with AI' ) }
		</LLMNotice>
	);
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
					<PerformanceInsightFeedback />
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
