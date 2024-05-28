import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useState } from 'react';

interface MetricsInsightProps {
	insight?: Insight;
	locked?: boolean;
	onClick?: () => void;
}

type Insight = {
	header?: ReactNode;
	description?: ReactNode;
};

const Card = styled( FoldableCard )`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;
	line-height: normal;
	letter-spacing: -0.1px;
`;

type InsightHeaderProps = {
	locked: boolean;
	children: React.ReactNode;
};

const InsightHeader = styled.div`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;
	filter: ${ ( props: InsightHeaderProps ) => ( props.locked ? 'blur(3px)' : 'none' ) };
	user-select: ${ ( props: InsightHeaderProps ) => ( props.locked ? 'none' : 'auto' ) };
`;

const InsightContent = styled.div`
	padding: 24px 0;
`;

export const MetricsInsight: React.FC< MetricsInsightProps > = ( props ) => {
	const translate = useTranslate();
	const { insight = {}, locked = false, onClick } = props;

	const lockedInsights = useLockedInsights();
	const [ randomInsight ] = useState( getRandomItem( lockedInsights ) );

	const itemToRender = locked ? randomInsight : insight;

	return (
		<Card
			className="metrics-insight-item"
			header={
				<InsightHeader locked={ locked } onClick={ onClick }>
					{ itemToRender.header }
				</InsightHeader>
			}
			screenReaderText={ translate( 'More' ) }
			compact
			clickableHeader
			smooth
			disabled={ locked }
			icon={ locked ? 'lock' : 'chevron-down' }
			iconSize={ 18 }
		>
			<InsightContent>{ itemToRender.description }</InsightContent>
		</Card>
	);
};

function getRandomItem( items: Array< Insight > ): Insight {
	return items[ Math.floor( Math.random() * items.length ) ];
}

function useLockedInsights(): Insight[] {
	const translate = useTranslate();

	return [
		{
			header: translate(
				'The full report will display all the information you need to improve your site.'
			),
		},
		{
			header: translate(
				'Click on the "Get full site report - It\'s free" button to unlock all the information you need.'
			),
		},
		{
			header: translate(
				"You'll be asked to provide your name and email, and then you will see all of your site stats."
			),
		},
		{
			header: translate(
				'The full report will display all the information about how your site is performing currently.'
			),
		},
		{
			header: translate( "Feel free to use our tool as many times as you want, it's free." ),
		},
	];
}
