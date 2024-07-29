import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import React, { ForwardedRef, forwardRef } from 'react';
import { calculateMetricsSectionScrollOffset } from 'calypso/site-profiler/utils/calculate-metrics-section-scroll-offset';

interface MetricsSectionProps {
	name: string;
	title: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	subtitleOnClick?: () => void;
	children?: React.ReactNode;
}

const Container = styled.div`
	margin: 150px 0;
	scroll-margin-top: ${ calculateMetricsSectionScrollOffset }px;
`;

const NameSpan = styled.span`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	color: var( --studio-gray-20 );
	font-size: 1rem;
	margin-bottom: 8px;
`;

const Title = styled.div`
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 60px;
	font-weight: 400;
	line-height: 100%;
	margin-bottom: 24px;

	span {
		font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
			'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
		font-size: 60px;
		font-style: normal;
		line-height: 100%;
		letter-spacing: -1.5px;

		&.good {
			background: linear-gradient( 270deg, #349f4b 10.23%, #3858e9 100% );
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}

		&.poor {
			background: linear-gradient( 90deg, #ff0094, #d63638 );
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
	}
`;

const Subtitle = styled.span`
	cursor: pointer;
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-size: 1rem;
	font-style: normal;
	font-weight: 500;
	line-height: 28px;

	&:hover {
		text-decoration-line: underline;
	}
`;

const SubtitleIcon = styled( Gridicon )`
	transform: translate( 0, 3px );
	margin-left: 8px;
`;

const Content = styled.div`
	margin-top: 64px;
`;

export const MetricsSection = forwardRef< HTMLObjectElement, MetricsSectionProps >(
	( props, ref: ForwardedRef< HTMLObjectElement > ) => {
		const { name, title, subtitle, children, subtitleOnClick } = props;

		return (
			<Container ref={ ref }>
				<NameSpan>{ name }</NameSpan>
				<Title>{ title }</Title>
				{ subtitle && (
					<Subtitle onClick={ subtitleOnClick }>
						{ subtitle }
						<SubtitleIcon icon="chevron-right" size={ 18 } />
					</Subtitle>
				) }

				{ children && <Content>{ children }</Content> }
			</Container>
		);
	}
);
