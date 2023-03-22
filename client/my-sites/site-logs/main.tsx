import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import { useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function SiteLogs() {
	const { __ } = useI18n();
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

	const titleHeader = __( 'Site Logs' );

	return (
		<Main wideLayout>
			<DocumentHead title={ titleHeader } />
			<FormattedHeader
				brandFont
				headerText={ titleHeader }
				subHeaderText={ __( 'View server logs to troubleshoot or debug problems with your site.' ) }
				align="left"
			/>
			<h2>Web logs</h2>
			<pre>{ formattedLogs }</pre>
		</Main>
	);
}
