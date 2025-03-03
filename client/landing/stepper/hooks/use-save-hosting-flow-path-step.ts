import { isAnyHostingFlow } from '@automattic/onboarding';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

export function useSaveHostingFlowPathStep( flow: string | null, currentPath: string ) {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const pathStep = isEmailVerified ? null : currentPath;

	useEffect( () => {
		if ( ! isEmailVerified && isAnyHostingFlow( flow ) ) {
			const prefKey = `hosting-flow-path-step-${ userId }`;
			dispatch( savePreference( prefKey, pathStep ) );
		}
	}, [ userId, isEmailVerified, pathStep, flow, dispatch ] );
}
