/**
 * External dependencies
 */
import { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { subscribe, getHttpData } from 'state/data-layer/http-data';
import { getBackups } from 'state/backups/actions';

interface Props {
	siteId: number;
}

const FILTER = { group: 'rewind' };

const QueryBackups: FunctionComponent< Props > = ( { siteId } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		const unsubscribe = subscribe( () => {
			const backups = getHttpData( getRequestActivityLogsId( siteId, FILTER ) ).data;
			if ( Array.isArray( backups ) ) {
				dispatch( getBackups( siteId, backups ) );
			}
		} );
		requestActivityLogs( siteId, FILTER );

		return unsubscribe;
	}, [ siteId, dispatch ] );

	return null;
};

export default QueryBackups;
