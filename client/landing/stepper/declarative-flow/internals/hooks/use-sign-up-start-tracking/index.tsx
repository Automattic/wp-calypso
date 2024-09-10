import { SENSEI_FLOW } from '@automattic/onboarding';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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

	// TODO: Using the new start flag we can remove reference to SENSEI_FLOW
	const firstStepSlug = ( flow.name === SENSEI_FLOW ? steps[ 1 ] : steps[ 0 ] ).slug;
	const isFirstStep = firstStepSlug === currentStepRoute;
	const flowVariant = flow.variantSlug;
	const signupStartEventProps = flow.useSignupStartEventProps?.();
	const isStartingFlow = isFirstStep || queryParams.has( 'start' );
	const flowName = flow.name;
	const shouldTrack = flow.isSignupFlow && isStartingFlow;

	const extraProps = useMemo(
		() => ( {
			...signupStartEventProps,
			...( flowVariant && { flow_variant: flowVariant } ),
		} ),
		[ signupStartEventProps, flowVariant ]
	);

	const removeSignupParam = useCallback( () => {
		if ( queryParams.has( 'start' ) ) {
			queryParams.delete( 'start' );
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
