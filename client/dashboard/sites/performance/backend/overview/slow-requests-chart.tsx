import { BarListChart, type SeriesData } from '@automattic/charts';
import '@automattic/charts/style.css';
import { useRouter } from '@tanstack/react-router';
import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import type { ApmSlowRequest, Site } from '@automattic/api-core';

const BAR_COLOR = '#3858E9';

function formatDuration( ms: number ): string {
	if ( ms >= 1000 ) {
		return `${ ( ms / 1000 ).toFixed( 2 ) } s`;
	}
	return sprintf(
		/* translators: %d is a number of milliseconds. */
		__( '%d ms' ),
		ms
	);
}

function truncate( text: string, max: number ): string {
	return text.length > max ? `${ text.slice( 0, max - 1 ) }…` : text;
}

export default function SlowRequestsChart( {
	site,
	slowRequests,
}: {
	site: Site;
	slowRequests: ApmSlowRequest[];
} ) {
	const router = useRouter();

	const { data, idToRequest } = useMemo( () => {
		const map = new Map< string, ApmSlowRequest >();
		const points = slowRequests.map( ( request ) => {
			map.set( request.id, request );
			return { label: request.id, value: request.duration_ms };
		} );
		const series: SeriesData[] = [
			{
				label: __( 'Duration' ),
				data: points,
				options: {
					stroke: BAR_COLOR,
					legendShapeStyle: { color: BAR_COLOR },
				},
			},
		];
		return { data: series, idToRequest: map };
	}, [ slowRequests ] );

	const navigateToRequest = ( id: string ) => {
		router.navigate( {
			to: `/sites/${ site.slug }/performance/backend/requests/${ id }`,
		} );
	};

	const rowHeight = 36;
	const height = Math.max( 200, slowRequests.length * rowHeight );

	return (
		<Card>
			<CardHeader>
				<Text weight={ 600 }>{ __( 'Slowest requests' ) }</Text>
			</CardHeader>
			<CardBody>
				<BarListChart
					data={ data }
					height={ height }
					maxWidth={ 1400 }
					withTooltips
					options={ {
						xScale: {},
						yScale: { paddingInner: 0.4 },
						labelFormatter: ( id ) => {
							const request = idToRequest.get( id );
							return request ? truncate( `${ request.method } ${ request.url }`, 60 ) : id;
						},
						valueFormatter: ( value ) => formatDuration( value ),
					} }
					onPointerUp={ ( { datum } ) => {
						if ( datum && 'label' in datum && typeof datum.label === 'string' ) {
							navigateToRequest( datum.label );
						}
					} }
				/>
			</CardBody>
		</Card>
	);
}
