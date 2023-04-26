import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
import SiteLogsTableRow from './site-logs-table-row';
import { Skeleton } from './skeleton';

import './style.scss';

type SiteLogs = SiteLogsData[ 'logs' ];

interface SiteLogsTableProps {
	logs?: SiteLogs;
	isLoading?: boolean;
}

export const SiteLogsTable = memo( function SiteLogsTable( {
	logs,
	isLoading,
}: SiteLogsTableProps ) {
	const { __ } = useI18n();
	const columns = useSiteColumns( logs );
	const siteGmtOffset = useCurrentSiteGmtOffset();

	if ( isLoading && ! logs?.length ) {
		return <Skeleton />;
	}

	if ( ! isLoading && ! logs?.length ) {
		return <>{ __( 'No log entries within this time range.' ) }</>;
	}

	return (
		<table className={ classnames( 'site-logs-table', { 'is-loading': isLoading } ) }>
			<thead>
				<tr>
					<th />
					{ columns.map( ( column ) => (
						<th key={ column }>{ column }</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ logs?.map( ( log, index ) => (
					// An index key is ok in this case because it's just as unique to the log entry as a
					// time stamp.
					<SiteLogsTableRow
						key={ index }
						columns={ columns }
						log={ log }
						siteGmtOffset={ siteGmtOffset }
					/>
				) ) }
			</tbody>
		</table>
	);
} );

function useSiteColumns( logs: SiteLogs | undefined ) {
	return useMemo( () => {
		if ( ! logs ) {
			return [];
		}

		const columns = new Set< string >();
		for ( const log of logs ) {
			for ( const key of Object.keys( log ) ) {
				columns.add( key );
			}
		}

		// The webserver logs have both `date` and `timestamp` columns and we want date to take
		// precedence, so check for presence of `date` column first.
		if ( columns.has( 'date' ) ) {
			columns.delete( 'date' );
			return [ 'date', ...columns ];
		}

		if ( columns.has( 'timestamp' ) ) {
			columns.delete( 'timestamp' );
			return [ 'timestamp', ...columns ];
		}

		return Array.from( columns );
	}, [ logs ] );
}
