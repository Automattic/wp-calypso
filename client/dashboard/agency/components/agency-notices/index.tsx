import { Fragment, createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface NoticeCandidate {
	id: string;
	isEligible: boolean;
	isLoading?: boolean;
	/** Urgent candidates outrank the notices every agency page shares. */
	isUrgent?: boolean;
	notice: ReactNode;
}

const SharedNoticesContext = createContext< NoticeCandidate[] >( [] );

export function SharedNoticesProvider( {
	candidates,
	children,
}: {
	candidates: NoticeCandidate[];
	children: ReactNode;
} ) {
	return (
		<SharedNoticesContext.Provider value={ candidates }>{ children }</SharedNoticesContext.Provider>
	);
}

/**
 * Stacks the page's notices in priority order until the MSD notice stack
 * component is available. Notices show from the top down as their data loads,
 * so none appears above one already on screen.
 */
export function AgencyNotices( { candidates = [] }: { candidates?: NoticeCandidate[] } ) {
	const sharedCandidates = useContext( SharedNoticesContext );
	const ordered = [
		...candidates.filter( ( candidate ) => candidate.isUrgent ),
		...sharedCandidates,
		...candidates.filter( ( candidate ) => ! candidate.isUrgent ),
	];

	// A notice that has loaded once keeps its place when its data refetches.
	const [ loadedIds, setLoadedIds ] = useState< ReadonlySet< string > >( () => new Set() );
	const newlyLoaded = ordered
		.filter( ( candidate ) => ! candidate.isLoading && ! loadedIds.has( candidate.id ) )
		.map( ( candidate ) => candidate.id )
		.join( ',' );
	useEffect( () => {
		if ( newlyLoaded ) {
			setLoadedIds( ( ids ) => new Set( [ ...ids, ...newlyLoaded.split( ',' ) ] ) );
		}
	}, [ newlyLoaded ] );

	const isReady = ( candidate: NoticeCandidate ) =>
		! candidate.isLoading || loadedIds.has( candidate.id );
	const firstPending = ordered.findIndex( ( candidate ) => ! isReady( candidate ) );
	const ready = firstPending === -1 ? ordered : ordered.slice( 0, firstPending );

	return ready
		.filter( ( candidate ) => candidate.isEligible )
		.map( ( candidate ) => <Fragment key={ candidate.id }>{ candidate.notice }</Fragment> );
}
