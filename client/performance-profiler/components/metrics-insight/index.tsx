import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	FullPageScreenshot,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { useDeviceTab } from 'calypso/hosting/performance/contexts/device-tab-context';
import { Tip } from 'calypso/performance-profiler/components/tip';
import { useSupportChatLLMQuery } from 'calypso/performance-profiler/hooks/use-support-chat-llm-query';
import { loggedInTips, tips } from 'calypso/performance-profiler/utils/tips';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { InsightContent } from './insight-content';
import { InsightHeader } from './insight-header';

interface MetricsInsightProps {
	insight: PerformanceMetricsItemQueryResponse;
	fullPageScreenshot: FullPageScreenshot;
	onClick?: () => void;
	index: number;
	url?: string;
	isWpcom: boolean;
	hash: string;
}

const Card = styled( FoldableCard )`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;
	line-height: normal;
	letter-spacing: -0.1px;

	&.foldable-card.card.is-expanded,
	&.is-compact {
		margin: 0;
	}
`;

type Header = {
	locked: boolean;
	children: React.ReactNode;
};

const Header = styled.div`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;
	width: 100%;

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

	.impact {
		padding: 4px 10px;
		border-radius: 4px;
		border: 1px solid transparent;
		float: right;
		font-size: 12px;
		color: var( --studio-black );

		&.fail {
			background-color: var( --studio-red-5 );
		}

		&.is-mobile {
			float: none;
			display: inline-block;
			margin-top: 8px;
		}
	}

	.counter {
		font-size: 16px;
		font-weight: 500;
		margin-right: 8px;
		width: 15px;
		text-align: right;
	}
`;

const Content = styled.div`
	padding: 15px 22px;
`;

export const MetricsInsight: React.FC< MetricsInsightProps > = ( props ) => {
	const { insight, fullPageScreenshot, onClick, index, isWpcom, hash, url } = props;
	const translate = useTranslate();
	const { activeTab } = useDeviceTab();

	const [ retrieveInsight, setRetrieveInsight ] = useState( false );
	const [ cardOpen, setCardOpen ] = useState( false );
	const {
		data: llmAnswer,
		isLoading,
		isFetched,
	} = useSupportChatLLMQuery(
		insight,
		hash,
		isWpcom,
		retrieveInsight,
		translate.localeSlug,
		activeTab
	);

	const isLoadingLlmAnswer = isLoading || ! isFetched;

	const { data } = useUrlPerformanceInsightsQuery( url, hash );
	const wpscanErrors = data?.wpscan?.errors;
	const hasWpscanErrors = wpscanErrors && Object.keys( wpscanErrors ).length > 0;
	const isWpscanLoading = data?.wpscan?.status !== 'completed' && ! hasWpscanErrors;

	useEffect( () => {
		if ( ( ! isWpscanLoading || hasWpscanErrors ) && cardOpen ) {
			setRetrieveInsight( true );
		}
	}, [ isWpscanLoading, hasWpscanErrors, cardOpen ] );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const site = useSelector( getSelectedSite );

	const tip = isLoggedIn && isWpcom ? loggedInTips[ insight.id ] : tips[ insight.id ];

	if ( props.url && tip && ! isWpcom ) {
		tip.link = `https://wordpress.com/setup/hosted-site-migration?from=${ props.url }&ref=performance-profiler-dashboard`;
	}

	if ( tip && isWpcom && ! site?.is_wpcom_atomic ) {
		tip.link = '';
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
			onClick={ () => setCardOpen( true ) }
			expanded={ retrieveInsight }
		>
			<Content>
				<InsightContent
					fullPageScreenshot={ fullPageScreenshot }
					data={ {
						...insight,
						description: llmAnswer?.messages,
					} }
					secondaryArea={ tip && <Tip { ...tip } /> }
					isLoading={ isLoadingLlmAnswer }
					isWpscanLoading={ isWpscanLoading }
					AIGenerated
					hash={ hash }
					url={ props.url }
					chatId={ llmAnswer?.chatId }
				/>
			</Content>
		</Card>
	);
};
