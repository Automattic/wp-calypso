import { __ } from '@wordpress/i18n';
import { PerformanceMetricsDetailsQueryResponse } from '../core-web-vitals';
import { getFormattedNumber, getFormattedSize } from 'calypso/site-profiler/utils/formatting-data';

interface InsightTreeProps {
	data: PerformanceMetricsDetailsQueryResponse;
}

export const InsightTree: React.FC< InsightTreeProps > = ( { data } ) => {
	const chains: { [ key: string ]: any } = data?.chains ?? {};

	return Object.keys( chains ).map( ( item: string, index ) => {
		const request = chains[ item ];
		const children = chains[ item ][ 'children' ];

		return (
			<ul className="tree" key={ index }>
				{ __( 'Initial Request' ) }
				<li>
					<details open>
						<summary>
							<Request request={ request } />
						</summary>
						<ul>
							{ Object.keys( children ).map( ( item, index ) => {
								const childRequest = children[ item ];
								return (
									<li key={ index }>
										<Request request={ childRequest } />
									</li>
								);
							} ) }
						</ul>
					</details>
				</li>
			</ul>
		);
	} );
};

function Request( { request }: { request: any } ) {
	const { url, responseReceivedTime, transferSize } = request.request;

	return (
		<span>
			{ __( '%(url)s - %(ms)sms, %(size)s', {
				args: {
					url,
					ms: getFormattedNumber( responseReceivedTime ),
					size: getFormattedSize( transferSize ),
				},
			} ) }
		</span>
	);
}
