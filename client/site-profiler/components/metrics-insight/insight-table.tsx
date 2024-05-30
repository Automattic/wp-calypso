import { useTranslate } from 'i18n-calypso';
import Markdown from 'react-markdown';
import { PerformanceMetricsDetailsQueryResponse } from 'calypso/data/site-profiler/types';

export function InsightTable( { data }: { data: PerformanceMetricsDetailsQueryResponse } ) {
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
					<tr key={ `tr-${ index }` }>
						{ headings.map( ( heading ) => (
							<td>
								<Cell data={ item[ heading.key ] } headingValueType={ heading.valueType } />
							</td>
						) ) }
					</tr>
				) ) }
			</tbody>
		</table>
	);
}

function Cell( {
	data,
	headingValueType,
}: {
	data: string | number | { [ key: string ]: any };
	headingValueType: string;
} ) {
	const translate = useTranslate();

	if ( typeof data === 'object' ) {
		switch ( data?.type ) {
			case 'node':
				return (
					<div>
						<p>{ data?.nodeLabel }</p>
						<pre>
							<code>{ data?.snippet }</code>
						</pre>
					</div>
				);

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
				return data?.url || data;
		}
	}

	if ( typeof data === 'string' || typeof data === 'number' ) {
		switch ( headingValueType ) {
			case 'ms':
			case 'timespanMs':
				// TODO: Implement a better visualization for ms values. Ex:  '1.2s' instead of '1200ms'
				return translate( '%(ms)sms', { args: { ms: getFormattedNumber( data ) } } );
			case 'bytes':
				return getFormattedSize( Number( data ) || 0 );
			case 'numeric':
				return getFormattedNumber( data, 2 );
			case 'link':
				return <Markdown>{ data.toString() }</Markdown>;
			case 'score':
				<span className={ `score ${ Number( data ) > 6 ? 'dangerous' : 'alert' } ` }>
					{ data }
				</span>;
			default:
				return data;
		}
	}

	return data;
}

function getFormattedNumber( value: number | string, dec = 2 ) {
	return Number( Number( value ?? 0 ).toFixed( dec ) );
}

function getFormattedSize( size: number ) {
	const i = size === 0 ? 0 : Math.floor( Math.log( size ) / Math.log( 1024 ) );
	return (
		+( size / Math.pow( 1024, i ) ).toFixed( 2 ) * 1 + ' ' + [ 'B', 'kB', 'MB', 'GB', 'TB' ][ i ]
	);
}
