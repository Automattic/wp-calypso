import { isEnabled } from '@automattic/calypso-config';
import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { Tip } from 'calypso/performance-profiler/components/tip';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query';
import { tips } from 'calypso/performance-profiler/utils/tips';
import { InsightContent } from './insight-content';
import { InsightHeader } from './insight-header';

interface MetricsInsightProps {
	insight: PerformanceMetricsItemQueryResponse;
	onClick?: () => void;
	index: number;
	url?: string;
}

const Card = styled( FoldableCard )`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;
	line-height: normal;
	letter-spacing: -0.1px;
`;

type Header = {
	locked: boolean;
	children: React.ReactNode;
};

const Header = styled.div`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;

	p {
		display: inline;
	}

	span {
		display: inline-block;
		color: var( --studio-gray-70 );

		&.is-mobile {
			display: block;
		}
	}

	.counter {
		font-size: 16px;
		font-weight: 500;
		margin-right: 8px;
	}
`;

const Content = styled.div`
	padding: 24px;
`;

export const MetricsInsight: React.FC< MetricsInsightProps > = ( props ) => {
	const translate = useTranslate();

	const { insight, onClick, index } = props;

	const [ retrieveInsight, setRetrieveInsight ] = useState( false );
	const { data: llmAnswer, isLoading: isLoadingLlmAnswer } = useSupportChatLLMQuery(
		insight.description ?? '',
		isEnabled( 'performance-profiler/llm' ) && retrieveInsight
	);
	const tip = tips[ insight.id ];

	if ( props.url && tip ) {
		tip.link = `https://wordpress.com/setup/hosted-site-migration?from=${ props.url }&ref=performance-profiler-dashboard`;
	}

	return (
		<Card
			className="metrics-insight-item"
			header={
				<Header onClick={ onClick }>
					<InsightHeader data={ insight } index={ index } />
				</Header>
			}
			screenReaderText={ translate( 'More' ) }
			compact
			clickableHeader
			smooth
			iconSize={ 18 }
			onClick={ () => setRetrieveInsight( true ) }
		>
			<Content>
				<InsightContent
					data={ {
						...insight,
						...( isEnabled( 'performance-profiler/llm' ) ? { description: llmAnswer } : {} ),
					} }
					secondaryArea={ tip && <Tip { ...tip } /> }
					isLoading={ isEnabled( 'performance-profiler/llm' ) && isLoadingLlmAnswer }
				/>
			</Content>
		</Card>
	);
};
