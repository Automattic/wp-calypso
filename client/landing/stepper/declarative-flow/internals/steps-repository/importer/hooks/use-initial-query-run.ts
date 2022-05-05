import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';

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

			// Update query params without refresh/rerender
			const path = `${ window.location.pathname }?${ currentSearchParams.toString() }`;
			window.history.pushState( { path }, '', path );
		}
	}

	return runImportInitially;
}
