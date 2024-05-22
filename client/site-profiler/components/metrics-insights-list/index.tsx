import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

type MetricsInsightsListProps = {
	insights?: Insight[];
	locked?: boolean;
};

type Insight = {
	header: string;
	description?: string;
};

const Container = styled.div`
	font-family: 'SF Pro Text';
	font-size: 16px;
	line-height: normal;
	letter-spacing: -0.1px;
`;

type InsightHeaderProps = {
	locked: boolean;
	children: React.ReactNode;
};
const InsightHeader = styled.div`
	font-family: 'SF Pro Text';
	font-size: 16px;
	filter: ${ ( props: InsightHeaderProps ) => ( props.locked ? 'blur(2px)' : 'none' ) };
	user-select: ${ ( props: InsightHeaderProps ) => ( props.locked ? 'none' : 'auto' ) };
`;

const InsightContent = styled.div`
	padding: 24px;
`;

export const MetricsInsightsList = ( props: MetricsInsightsListProps ) => {
	const translate = useTranslate();
	const { insights = [], locked = false } = props;
	const lockedInsights = useLockedInsights();

	const itemsToRender = locked ? lockedInsights : insights;
	return (
		<Container className="metrics-insights-list">
			{ itemsToRender.map( ( insight ) => (
				<FoldableCard
					header={ <InsightHeader locked={ locked }>{ insight.header }</InsightHeader> }
					screenReaderText={ translate( 'More' ) }
					compact
					clickableHeader
					smooth
					disabled={ locked }
					icon={ locked ? 'lock' : 'chevron-down' }
				>
					<InsightContent>{ insight.description }</InsightContent>
				</FoldableCard>
			) ) }
		</Container>
	);
};

export function useLockedInsights(): Insight[] {
	const translate = useTranslate();

	return [
		{
			header: translate(
				'The full report will display all the information you need to improve your site domain, hosting, performance, health, and security'
			),
		},
		{
			header: translate(
				'Click on the "Get full site report - It\'s free" button to unlock all the information you need to make your site stand out on the web'
			),
		},
		{
			header: translate(
				"You'll be asked to provide your name and email, and once you confirm your email, you should be able to view all of your site stats"
			),
		},
		{
			header: translate(
				'The full report will display all the information about how your site is performing currently along with information about how to improve it'
			),
		},
		{
			header: translate(
				"Feel free to use our tool as many times as you want, it's free, and once you have unlocked all functionalities you can see information for any site"
			),
		},
	];
}
