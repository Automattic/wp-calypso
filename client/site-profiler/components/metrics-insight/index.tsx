import { FoldableCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';

interface MetricsInsightProps {
	insight?: Insight;
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

const Header = styled.div`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 16px;

	span {
		display: inline-block;

		&.is-mobile {
			display: block;
		}
	}
`;

const Content = styled.div`
	padding: 8px 0 24px;
`;

export const MetricsInsight: React.FC< MetricsInsightProps > = ( props ) => {
	const translate = useTranslate();
	const { insight = {} } = props;

	return (
		<Card
			className="metrics-insight-item"
			header={ <Header>{ insight.header }</Header> }
			screenReaderText={ translate( 'More' ) }
			compact
			clickableHeader
			smooth
			icon="chevron-down"
			iconSize={ 18 }
		>
			<Content>{ insight.description }</Content>
		</Card>
	);
};
