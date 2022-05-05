import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { updateQueryParams } from '../../import/util';

export function useInitialQueryRun( siteId: number | undefined ) {
	const currentSearchParams = useQuery();
	const [ runImportInitially, setRunImportInitially ] = useState( false );

	useEffect( checkInitialRunState, [ siteId ] );

	function checkInitialRunState() {
		// run query param indicates that the import process can be run immediately,
		// but before proceeding, remove it from the URL path
		// because of the browser's back or refresh edge cases
		if ( currentSearchParams.get( 'run' ) === 'true' ) {
			setRunImportInitially( true );
			currentSearchParams.delete( 'run' );
			updateQueryParams( currentSearchParams.toString() );
		}
	}

	return runImportInitially;
}
