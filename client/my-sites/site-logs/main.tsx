import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function SiteLogs() {
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();

	const [ startTime ] = useState( moment().subtract( 7, 'd' ).unix() );
	const [ endTime ] = useState( moment().unix() );

	const { data } = useSiteLogsQuery( siteId, {
		logType: 'web',
		start: startTime,
		end: endTime,
		sort_order: 'desc',
		page_size: 10,
	} );

	const formattedLogs = data?.logs
		.map( ( log ) =>
			Object.entries( log )
				.sort( ( [ keyA ], [ keyB ] ) => {
					if ( keyA === 'date' ) {
						return -1;
					}
					if ( keyB === 'date' ) {
						return 1;
					}
					return keyA.localeCompare( keyB );
				} )
				.map( ( [ key, value ] ) => `"${ key }" = ${ value }` )
				.join( '\t' )
		)
		.join( '\n' );

	return (
		<>
			<h2>Web logs</h2>
			<pre>{ formattedLogs }</pre>
		</>
	);
}
