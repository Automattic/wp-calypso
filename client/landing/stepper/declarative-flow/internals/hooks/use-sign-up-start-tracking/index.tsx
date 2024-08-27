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
	const [ queryParams, setQuery ] = useSearchParams();
	const steps = flow.useSteps();
	const flowVariant = flow.variantSlug;
	const flowName = flow.name;
	const ref = queryParams.get( 'ref' ) || '';
	const isSignupStep = queryParams.has( 'signup' );

	// TODO: Using the new signup flag we can remove reference to SENSEI_FLOW
	const firstStepSlug = ( flowName === SENSEI_FLOW ? steps[ 1 ] : steps[ 0 ] ).slug;
	const isFirstStep = firstStepSlug === currentStepRoute;
	const shouldTrack = flow.isSignupFlow && ( isFirstStep || isSignupStep );

	const signupStartEventProps = useSnakeCasedKeys( {
		input: flow.useTracksEventProps?.()[ STEPPER_TRACKS_EVENT_SIGNUP_START ],
	} );

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

		recordSignupStart( flowName, ref, {
			...signupStartEventProps,
			...( flowVariant && { flow_variant: flowVariant } ),
		} );
		removeSignupParam();
	}, [ signupStartEventProps, flowName, flowVariant, ref, removeSignupParam, shouldTrack ] );
};
