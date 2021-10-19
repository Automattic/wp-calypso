import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIsAnchorFm } from '../path';
import useFseBetaEligibility from './use-fse-beta-eligibility';
import type { Dispatch, SetStateAction } from 'react';

export default function useFseBetaOptInStep(): [
	boolean,
	boolean,
	Dispatch< SetStateAction< boolean > >
] {
	const isAnchorFm = useIsAnchorFm();
	const isFseBetaEligible = useFseBetaEligibility();
	const isSiteEligibleForFseBeta = isFseBetaEligible && ! isAnchorFm;
	const { action: historyAction } = useHistory();

	const [ isFseBetaOptInStep, setIsFseBetaOptInStep ] = useState( false );

	useEffect( () => {
		if ( isSiteEligibleForFseBeta && historyAction === 'POP' ) {
			setIsFseBetaOptInStep( true );
		}
	}, [ historyAction, isSiteEligibleForFseBeta ] );

	return [ isFseBetaOptInStep, isSiteEligibleForFseBeta, setIsFseBetaOptInStep ];
}
