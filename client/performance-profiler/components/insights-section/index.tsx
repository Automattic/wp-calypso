import { SelectDropdown } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import {
	FullPageScreenshot,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MetricsInsight } from 'calypso/performance-profiler/components/metrics-insight';
import { filterRecommendations, metricsNames } from 'calypso/performance-profiler/utils/metrics';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { updateQueryParams } from 'calypso/performance-profiler/utils/query-params';
import './style.scss';

type InsightsSectionProps = {
	fullPageScreenshot: FullPageScreenshot;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	url: string;
	isWpcom: boolean;
	hash: string;
	filter?: string;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

const AIBadge = styled.span`
	padding: 0 8px;
	margin-left: 8px;
	margin-top: 2px;
	width: fit-content;
	height: fit-content;
	border-radius: 4px;
	float: right;
	font-size: 12px;
	line-height: 20px;
	color: var( --studio-gray-100 );
	background: linear-gradient(
			0deg,
			rgba( 255, 255, 255, 0.95 ) 0%,
			rgba( 255, 255, 255, 0.95 ) 100%
		),
		linear-gradient( 90deg, #4458e4 0%, #069e08 100% );

	&.is-mobile {
		float: none;
		display: block;
		margin-left: 0;
		margin-top: 8px;
	}
`;

export const InsightsSection = forwardRef(
	( props: InsightsSectionProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const translate = useTranslate();
		const isMobile = ! useDesktopBreakpoint();
		const { audits, fullPageScreenshot, isWpcom, hash, filter, onRecommendationsFilterChange } =
			props;
		const [ selectedFilter, setSelectedFilter ] = useState( filter ?? 'all' );

		const sumMetricSavings = ( key: string ) =>
			Object.values( audits[ key ].metricSavings ?? {} ).reduce( ( acc, val ) => acc + val, 0 );

		const sortInsightKeys = ( a: string, b: string ) =>
			sumMetricSavings( b ) - sumMetricSavings( a );

		const filteredAudits = Object.keys( audits )
			.filter( ( key ) => filterRecommendations( selectedFilter, audits[ key ] ) )
			.sort( sortInsightKeys );
		const onFilter = useCallback(
			( option: { label: string; value: string } ) => {
				recordTracksEvent( 'calypso_performance_profiler_recommendations_filter_change', {
					filter: option.value,
				} );
				setSelectedFilter( option.value );
				if ( onRecommendationsFilterChange ) {
					onRecommendationsFilterChange( option.value );
				} else {
					updateQueryParams( { filter: option.value }, true );
				}
			},
			[ onRecommendationsFilterChange ]
		);

		useEffect( () => {
			if ( filter && filter !== selectedFilter ) {
				setSelectedFilter( filter );
			}
		}, [ selectedFilter, filter ] );

		return (
			<div className="performance-profiler-insights-section" ref={ ref }>
				<div className="header">
					<div>
						<h2 className="title">
							{ translate( 'Personalized Recommendations' ) }
							<AIBadge className={ clsx( { 'is-mobile': isMobile } ) }>
								{ translate( 'Generated with AI' ) }
							</AIBadge>
						</h2>
						<p className="subtitle">
							{ getSubtitleText( selectedFilter, filteredAudits.length, translate ) }
						</p>
					</div>
					<div className="filter">
						<SelectDropdown
							value={ selectedFilter }
							initialSelected={ selectedFilter }
							onSelect={ onFilter }
							selectedText={
								selectedFilter === 'all'
									? translate( 'All recommendations' )
									: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name
							}
							selectedCount={ filteredAudits.length }
							options={ [
								{ label: 'All recommendations', value: 'all', count: Object.keys( audits ).length },
							].concat(
								Object.keys( metricsNames ).map( ( key ) => ( {
									label: metricsNames[ key as keyof typeof metricsNames ]?.name,
									value: key,
									count: Object.keys( audits ).filter( ( auditKey ) =>
										filterRecommendations( key, audits[ auditKey ] )
									).length,
								} ) )
							) }
							compact
						/>
					</div>
				</div>
				{ filteredAudits.map( ( key, index ) => (
					<MetricsInsight
						key={ `insight-${ index }` }
						insight={ { ...audits[ key ], id: key } }
						fullPageScreenshot={ fullPageScreenshot }
						index={ index }
						url={ props.url }
						isWpcom={ isWpcom }
						hash={ hash }
						onClick={ () =>
							recordTracksEvent( 'calypso_performance_profiler_insight_click', {
								url: props.url,
								key,
								version: profilerVersion(),
							} )
						}
					/>
				) ) }
			</div>
		);
	}
);

function getSubtitleText(
	selectedFilter: string,
	numRecommendations: number,
	translate: ReturnType< typeof useTranslate >
) {
	if ( numRecommendations ) {
		if ( selectedFilter === 'all' ) {
			return translate(
				'We found %(numRecommendations)d thing you can do for improving your page.',
				'We found %(numRecommendations)d things you can do for improving your page.',
				{
					args: { numRecommendations },
					count: numRecommendations,
				}
			);
		}
		return translate(
			'We found %(numRecommendations)d thing you can do for improving %(metric)s.',
			'We found %(numRecommendations)d things you can do for improving %(metric)s.',
			{
				args: {
					numRecommendations,
					metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
				},
				count: numRecommendations,
			}
		);
	}

	if ( selectedFilter === 'all' ) {
		return translate(
			"Great job! We didn't find any recommendations for improving the speed of your page."
		);
	}

	return translate( "Great job! We didn't find any recommendations for improving %(metric)s.", {
		args: {
			metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
		},
	} );
}
