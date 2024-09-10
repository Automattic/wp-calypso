import { useTranslate } from 'i18n-calypso';
import { PerformanceMetricsDetailsQueryResponse } from 'calypso/data/site-profiler/types';
import { getFormattedNumber, getFormattedSize } from 'calypso/site-profiler/utils/formatting-data';

interface InsightTreeProps {
	data: PerformanceMetricsDetailsQueryResponse;
}

export const InsightTree: React.FC< InsightTreeProps > = ( { data } ) => {
	const translate = useTranslate();
	const chains: { [ key: string ]: any } = data?.chains ?? {};

	return Object.keys( chains ).map( ( item: string, index ) => {
		const request = chains[ item ];
		const children = chains[ item ][ 'children' ];

		return (
			<ul className="tree" key={ index }>
				{ translate( 'Initial Request' ) }
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
	const translate = useTranslate();
	const { url, responseReceivedTime, transferSize } = request.request;

	return (
		<span>
			{ translate( '%(url)s - {{b}}%(ms)sms{{/b}}, %(size)s', {
				args: {
					url,
					ms: getFormattedNumber( responseReceivedTime ),
					size: getFormattedSize( transferSize ),
				},
				components: { b: <b /> },
			} ) }
		</span>
	);
}
