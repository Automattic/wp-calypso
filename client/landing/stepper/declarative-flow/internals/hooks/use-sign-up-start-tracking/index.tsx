import { SENSEI_FLOW } from '@automattic/onboarding';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STEPPER_TRACKS_EVENT_SIGNUP_START } from 'calypso/landing/stepper/constants';
import useSnakeCasedKeys from 'calypso/landing/stepper/utils/use-snake-cased-keys';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import { type Flow } from '../../types';

/**
 * Hook to track the start of a signup flow.
 */
interface Props {
	flow: Flow;
	currentStepRoute: string;
}

export const useSignUpStartTracking = ( { flow, currentStepRoute }: Props ) => {
	const steps = flow.useSteps();
	const [ queryParams, setQuery ] = useSearchParams();
	const ref = queryParams.get( 'ref' ) || '';
	const isSignupStep = queryParams.has( 'signup' );

	// TODO: Using the new signup flag we can remove reference to SENSEI_FLOW
	const firstStepSlug = ( flow.name === SENSEI_FLOW ? steps[ 1 ] : steps[ 0 ] ).slug;
	const isFirstStep = firstStepSlug === currentStepRoute;
	const extraProps = useSnakeCasedKeys( {
		input: {
			flowVariant: flow.variantSlug,
			...flow.useTracksEventProps?.()[ STEPPER_TRACKS_EVENT_SIGNUP_START ],
		},
	} );

	const flowName = flow.name;
	const shouldTrack = flow.isSignupFlow && ( isFirstStep || isSignupStep );
	const removeSignupParam = useCallback( () => {
		if ( queryParams.has( 'signup' ) ) {
			queryParams.delete( 'signup' );
			setQuery( queryParams );
		}
	}, [ queryParams, setQuery ] );

	useEffect( () => {
		if ( ! shouldTrack ) {
			return;
		}
		recordSignupStart( flowName, ref, extraProps || {} );
		removeSignupParam();
	}, [ extraProps, flowName, ref, removeSignupParam, shouldTrack ] );
};
