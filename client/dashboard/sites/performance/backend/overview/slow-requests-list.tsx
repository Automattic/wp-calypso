import { useRouter } from '@tanstack/react-router';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import type { ApmSlowRequest, Site } from '@automattic/api-core';

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

function formatRelativeTime( timestamp: number ): string {
	const diffSec = Math.floor( ( Date.now() - timestamp ) / 1000 );
	if ( diffSec < 60 ) {
		return __( 'just now' );
	}
	const diffMin = Math.floor( diffSec / 60 );
	if ( diffMin < 60 ) {
		return sprintf(
			/* translators: %d is a number of minutes. */
			__( '%dm ago' ),
			diffMin
		);
	}
	const diffHr = Math.floor( diffMin / 60 );
	return sprintf(
		/* translators: %d is a number of hours. */
		__( '%dh ago' ),
		diffHr
	);
}

export default function SlowRequestsList( {
	site,
	slowRequests,
}: {
	site: Site;
	slowRequests: ApmSlowRequest[];
} ) {
	const router = useRouter();

	const navigateToRequest = ( request: ApmSlowRequest ) => {
		router.navigate( {
			to: `/sites/${ site.slug }/performance/backend/requests/${ request.id }`,
		} );
	};

	return (
		<Card>
			<CardHeader>
				<Text weight={ 600 }>{ __( 'Slowest requests' ) }</Text>
			</CardHeader>
			<CardBody>
				<table style={ { width: '100%', borderCollapse: 'collapse' } }>
					<thead>
						<tr>
							<th style={ { textAlign: 'start', padding: '8px 0' } }>{ __( 'URL' ) }</th>
							<th style={ { textAlign: 'start', padding: '8px 0' } }>{ __( 'Method' ) }</th>
							<th style={ { textAlign: 'start', padding: '8px 0' } }>{ __( 'Status' ) }</th>
							<th style={ { textAlign: 'end', padding: '8px 0' } }>{ __( 'Duration' ) }</th>
							<th style={ { textAlign: 'end', padding: '8px 0' } }>{ __( 'When' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ slowRequests.map( ( request ) => (
							<tr key={ request.id }>
								<td style={ { padding: '8px 0' } }>
									<Button variant="link" onClick={ () => navigateToRequest( request ) }>
										{ request.url }
									</Button>
								</td>
								<td style={ { padding: '8px 0' } }>{ request.method }</td>
								<td style={ { padding: '8px 0' } }>{ request.status }</td>
								<td style={ { padding: '8px 0', textAlign: 'end' } }>
									{ formatDuration( request.duration_ms ) }
								</td>
								<td style={ { padding: '8px 0', textAlign: 'end' } }>
									<Text variant="muted">{ formatRelativeTime( request.timestamp ) }</Text>
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</CardBody>
		</Card>
	);
}
