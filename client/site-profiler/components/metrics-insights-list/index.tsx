import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

type MetricsInsightsListProps = {
	insights: Insight[];
};

type Insight = {
	header: string;
	description: string;
};

const Container = styled.div`
	font-family: 'SF Pro Text';
	font-size: 16px;
	line-height: normal;
	letter-spacing: -0.1px;
`;

const InsightHeader = styled.div`
	font-family: 'SF Pro Text';
	font-size: 16px;
`;

const InsightContent = styled.div`
	padding: 24px;
`;

export const MetricsInsightsList = ( props: MetricsInsightsListProps ) => {
	const translate = useTranslate();
	const { insights } = props;

	return (
		<Container className="metrics-insights-list">
			{ insights.map( ( insight ) => (
				<FoldableCard
					header={ <InsightHeader>{ insight.header }</InsightHeader> }
					screenReaderText={ translate( 'More' ) }
					compact
					clickableHeader
					smooth
				>
					<InsightContent>{ insight.description }</InsightContent>
				</FoldableCard>
			) ) }
		</Container>
	);
};
