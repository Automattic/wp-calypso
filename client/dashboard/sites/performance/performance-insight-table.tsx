import { DataViews } from '@wordpress/dataviews';
import Markdown from 'react-markdown';
import { Text } from '../../components/text';
import { getFormattedNumber, getFormattedSize } from '../../utils/site-performance';
import { InsightScreenshotWithOverlay } from './performance-insight-screenshot';
import type {
	SitePerformanceReport,
	PerformanceMetricAuditDetails,
	PerformanceMetricAuditDetailsItem,
} from '@automattic/api-core';

const renderNode = (
	data: { [ key: string ]: any },
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ]
) => {
	const rect = data.boundingRect;

	if ( fullPageScreenshot && rect && rect.width !== 0 && rect.height !== 0 ) {
		const maxThumbnailSize = { width: 147, height: 100 };
		return (
			<InsightScreenshotWithOverlay
				nodeId={ data.lhId }
				screenshot={ fullPageScreenshot.screenshot }
				elementRectSC={ rect }
				maxRenderSizeDC={ maxThumbnailSize }
			/>
		);
	}
	return (
		<div>
			<p>{ data?.nodeLabel }</p>
			<code>{ data?.snippet }</code>
		</div>
	);
};

const PerformanceInsightTable = ( {
	details,
	fullPageScreenshot,
}: {
	details: PerformanceMetricAuditDetails;
	fullPageScreenshot: SitePerformanceReport[ 'fullPageScreenshot' ];
} ) => {
	const { headings = [], items = [] } = details ?? {};
	const fields = headings.map( ( heading ) => ( {
		id: heading.key,
		label: heading.label,
		enableSorting: false,
		enableHiding: false,
		render: ( { item }: { item: PerformanceMetricAuditDetailsItem } ) => {
			const value =
				heading.subItemsHeading && item.__isSubItem
					? item[ heading.subItemsHeading.key ]
					: item[ heading.key ];

			const valueType =
				heading.subItemsHeading && item.__isSubItem
					? heading.subItemsHeading.valueType ?? heading.valueType
					: heading.valueType;

			if ( typeof value === 'object' ) {
				switch ( value?.type ) {
					case 'node':
						return renderNode( value, fullPageScreenshot );

					case 'code':
						return (
							<div>
								<pre>
									<code>{ value?.value }</code>
								</pre>
							</div>
						);
					case 'numeric':
						return getFormattedNumber( value.value );
					case 'url':
					case 'source-location':
						if ( typeof value.location === 'object' ) {
							return [ value.location.url, value.location.line, value.location.column ].join( ':' );
						}
						return value?.url;
				}

				return value?.value;
			}

			if ( typeof value === 'string' || typeof value === 'number' ) {
				switch ( valueType ) {
					case 'ms':
					case 'timespanMs':
						return `${ getFormattedNumber( value ) }ms`;
					case 'bytes':
						return getFormattedSize( Number( value ) || 0 );
					case 'numeric':
						return getFormattedNumber( value );
					case 'link':
						return <Markdown>{ value.toString() }</Markdown>;
					case 'score':
						return <Text intent={ Number( value ) > 6 ? 'error' : 'warning' }>{ value }</Text>;
					default:
						return <span style={ { wordBreak: 'break-all' } }>{ value }</span>;
				}
			}
			return value;
		},
	} ) );

	const view = {
		fields: fields.map( ( field ) => field.id ),
		type: 'table' as const,
		groupBy: details.isEntityGrouped ? { field: 'entity', direction: 'asc' as const } : undefined,
		layout: {
			enableMoving: false,
		},
	};

	return (
		<DataViews< PerformanceMetricAuditDetailsItem & { id: string; __isSubItem?: boolean } >
			data={
				details.isEntityGrouped
					? items
							.map( ( item, i ) => [
								{
									...item,
									id: `${ i }`,
								},
								...( item.subItems?.items ?? [] ).map( ( subItem, j ) => ( {
									...subItem,
									id: `${ item.entity }- ${ j }`,
									entity: item.entity,
									__isSubItem: true,
								} ) ),
							] )
							.flat()
					: items.map( ( item, i ) => ( { ...item, id: `${ i }` } ) )
			}
			fields={ fields }
			view={ view }
			defaultLayouts={ { table: {} } }
			paginationInfo={ { totalItems: items.length, totalPages: 1 } }
			onChangeView={ () => {} }
		>
			<DataViews.Layout />
		</DataViews>
	);
};

export default PerformanceInsightTable;
