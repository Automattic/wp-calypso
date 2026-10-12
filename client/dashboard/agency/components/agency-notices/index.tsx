import { Fragment, createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface NoticeCandidate {
	id: string;
	isEligible: boolean;
	/** True until the data that decides `isEligible` has loaded. */
	isLoading?: boolean;
	/** Urgent candidates outrank the notices every agency page shares. */
	isUrgent?: boolean;
	notice: ReactNode;
}

const SharedNoticesContext = createContext< NoticeCandidate[] >( [] );

/**
 * Provides the notices every agency page shows, such as the email
 * verification notice.
 */
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
 * Shows the agency page's notices one below the other, until the MSD notice
 * stack (top notice + "Review all") is available.
 *
 * Pages pass their candidates in priority order. The shared candidates go after
 * the page's urgent ones and before the rest. Nothing shows until every
 * candidate has loaded, so the notices don't appear one by one and push each
 * other around.
 */
export function AgencyNotices( { candidates = [] }: { candidates?: NoticeCandidate[] } ) {
	const sharedCandidates = useContext( SharedNoticesContext );
	const ordered = [
		...candidates.filter( ( candidate ) => candidate.isUrgent ),
		...sharedCandidates,
		...candidates.filter( ( candidate ) => ! candidate.isUrgent ),
	];

	const isSettled = ordered.every( ( candidate ) => ! candidate.isLoading );
	const [ hasSettled, setHasSettled ] = useState( isSettled );
	useEffect( () => {
		if ( isSettled ) {
			setHasSettled( true );
		}
	}, [ isSettled ] );

	if ( ! hasSettled && ! isSettled ) {
		return null;
	}

	return ordered
		.filter( ( candidate ) => candidate.isEligible )
		.map( ( candidate ) => <Fragment key={ candidate.id }>{ candidate.notice }</Fragment> );
}
