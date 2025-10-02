import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import AILoadingIcon from 'calypso/assets/images/performance-profiler/ai-loading-icon.svg';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query'; // eslint-disable-line
import { useLocale } from '../../app/locale';
import { Text } from '../../components/text';
import useLoadingSteps from './use-loading-steps';
import type { PerformanceMetricsItemQueryResponse, DeviceToggleType } from './types';
import type { SitePerformanceReport } from '@automattic/api-core';
import './performance-insight.scss';

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
				<Text intent={ intent } size={ 16 } weight={ 500 }>
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

	return (
		<HStack className="performance-insight__loading" justify="flex-start">
			<img src={ AILoadingIcon } alt={ __( 'AI generated content icon' ) } />
			<Text>{ steps[ step ] }</Text>
		</HStack>
	);
};

export const PerformanceInsight = ( {
	device,
	insight,
	fullPageScreenshot,
	isWpcom,
	hash,
}: {
	device: DeviceToggleType;
	insight: PerformanceMetricsItemQueryResponse;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
	isWpcom: boolean;
	hash: string;
} ) => {
	const locale = useLocale();
	const { data: llmAnswer } = useSupportChatLLMQuery(
		insight,
		hash,
		isWpcom,
		true,
		locale,
		device
	);

	console.log( { fullPageScreenshot } ); // eslint-disable-line no-console

	if ( ! llmAnswer ) {
		return <PerformanceInsightLoading />;
	}

	return (
		<VStack style={ { padding: '0 16px' } }>
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
		</VStack>
	);
};
