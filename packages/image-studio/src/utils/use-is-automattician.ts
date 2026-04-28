import { fetchReaderTeams } from '@automattic/api-core';
import { useEffect, useState } from '@wordpress/element';

let cachedResult: boolean | null = null;
let inFlight: Promise< boolean > | null = null;

async function loadIsAutomattician(): Promise< boolean > {
	const data = await fetchReaderTeams();
	return data.teams.some( ( team ) => team.slug === 'a8c' );
}

/**
 * Resolves whether the current user is an Automattician (member of the `a8c`
 * reader team). Result is cached at module scope, so multiple consumers share
 * a single network request.
 *
 * Returns `null` while the check is in flight. Treats any fetch failure as a
 * negative answer so the gating consumer fails closed.
 *
 * Stop-gap for the internal release. Long-term, the surface should be loaded
 * via Jetpack the same way Image Studio is, with the gate handled there.
 */
export function useIsAutomattician(): boolean | null {
	const [ result, setResult ] = useState< boolean | null >( cachedResult );

	useEffect( () => {
		if ( cachedResult !== null ) {
			return;
		}

		if ( ! inFlight ) {
			inFlight = loadIsAutomattician().catch( () => false );
		}

		let cancelled = false;
		inFlight.then( ( value ) => {
			cachedResult = value;
			if ( ! cancelled ) {
				setResult( value );
			}
		} );

		return () => {
			cancelled = true;
		};
	}, [] );

	return result;
}
