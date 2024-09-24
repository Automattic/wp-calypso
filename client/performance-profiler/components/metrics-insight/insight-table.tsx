import { useTranslate } from 'i18n-calypso';
import Markdown from 'react-markdown';
import {
	FullPageScreenshot,
	PerformanceMetricsDetailsQueryResponse,
} from 'calypso/data/site-profiler/types';
import { getFormattedNumber, getFormattedSize } from 'calypso/site-profiler/utils/formatting-data';
import { InsightScreenshotWithOverlay } from './insight-screenshot';

export function InsightTable( {
	data,
	fullPageScreenshot,
}: {
	data: PerformanceMetricsDetailsQueryResponse;
	fullPageScreenshot: FullPageScreenshot;
} ) {
	const { headings = [], items = [] } = data ?? {};

	return (
		<table>
			<thead>
				<tr>
					{ headings.map( ( heading, index ) => (
						<th key={ `th-${ index }` }>{ heading.label }</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ items.map( ( item, index ) => (
					<>
						<tr key={ `tr-${ index }` }>
							{ headings.map( ( heading ) => (
								<td key={ `td-${ index }-${ heading.key }` }>
									<Cell
										data={ item[ heading.key ] }
										fullPageScreenshot={ fullPageScreenshot }
										headingValueType={ heading.valueType }
									/>
								</td>
							) ) }
						</tr>
						{ item.subItems && typeof item.subItems === 'object' && (
							<SubRows
								items={ item.subItems?.items }
								headings={ headings }
								key={ `subrows-${ index }` }
							/>
						) }
					</>
				) ) }
			</tbody>
		</table>
	);
}

function SubRows( { items, headings }: { items: any[]; headings: any[] } ) {
	return items.map( ( subItem, subIndex ) => (
		<tr key={ `sub-${ subIndex }` } className="sub">
			{ headings.map( ( heading, index ) => {
				const { subItemsHeading, valueType } = heading;

				return (
					<td key={ `subrow-${ index }` }>
						<Cell
							data={ subItem[ subItemsHeading?.key ] }
							headingValueType={ subItemsHeading?.valueType ?? valueType }
						/>
					</td>
				);
			} ) }
		</tr>
	) );
}

function Cell( {
	data,
	headingValueType,
	fullPageScreenshot,
}: {
	data: string | number | { [ key: string ]: any };
	headingValueType: string;
	fullPageScreenshot?: FullPageScreenshot;
} ) {
	const translate = useTranslate();

	const renderNode = ( data: { [ key: string ]: any } ) => {
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

	if ( typeof data === 'object' ) {
		switch ( data?.type ) {
			case 'node':
				return renderNode( data );

			case 'code':
				return (
					<div>
						<pre>
							<code>{ data?.value }</code>
						</pre>
					</div>
				);
			case 'numeric':
				return getFormattedNumber( data.value );
			case 'url':
			case 'source-location':
				if ( data?.location ) {
					return `${ data.location.url }:${ data.location.line }:${ data.location.column }`;
				}
				return data?.url;
		}

		return data?.value;
	}

	if ( typeof data === 'string' || typeof data === 'number' ) {
		switch ( headingValueType ) {
			case 'ms':
			case 'timespanMs':
				// TODO: Implement a better visualization for ms values. Ex:  '1.2s' instead of '1200ms'
				return translate( '%(ms)dms', {
					comment: 'value to be displayed in milliseconds',
					args: { ms: getFormattedNumber( data ) },
				} );
			case 'bytes':
				return getFormattedSize( Number( data ) || 0 );
			case 'numeric':
				return getFormattedNumber( data, 2 );
			case 'link':
				return <Markdown>{ data.toString() }</Markdown>;
			case 'score':
				return (
					<span className={ `score ${ Number( data ) > 6 ? 'dangerous' : 'alert' } ` }>
						{ data }
					</span>
				);
			default:
				return data;
		}
	}

	return data;
}
