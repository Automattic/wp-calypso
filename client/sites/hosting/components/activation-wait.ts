import { useEffect, useState } from 'react';

// A transfer reports `completed` once the software job is queued, so the site answers as Atomic a
// moment later. Past this the wait has stopped being informative and needs an ending.
export const ACTIVATION_DEADLINE_MS = 2 * 60 * 1000;

// Keyed by site: SPA navigation keeps the caller mounted across a site switch, so the next site
// inherits neither the previous one's clock nor its verdict.
export function useActivationDeadline( siteId: number | null, isWaiting: boolean ) {
	const [ stalledSiteId, setStalledSiteId ] = useState< number | null >( null );

	useEffect( () => {
		if ( ! isWaiting || siteId === null ) {
			return;
		}
		const timer = setTimeout( () => setStalledSiteId( siteId ), ACTIVATION_DEADLINE_MS );
		return () => clearTimeout( timer );
	}, [ isWaiting, siteId ] );

	return stalledSiteId !== null && stalledSiteId === siteId;
}
