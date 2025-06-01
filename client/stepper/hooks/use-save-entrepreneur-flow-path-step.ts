import { ENTREPRENEUR_FLOW } from '@automattic/onboarding';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

export function useSaveEntrepreneurFlowPathStep( flow: string | null, currentPath: string ) {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const pathStep = isEmailVerified ? null : currentPath;

	useEffect( () => {
		if ( ! isEmailVerified && flow === ENTREPRENEUR_FLOW ) {
			const prefKey = `entrepreneur-flow-path-step-${ userId }`;
			dispatch( savePreference( prefKey, pathStep ) );
		}
	}, [ userId, isEmailVerified, pathStep, flow, dispatch ] );
}
