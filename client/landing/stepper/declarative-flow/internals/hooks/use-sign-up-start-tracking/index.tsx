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
	const isSignupStep = queryParams.has( 'signup' );

	// TODO: Using the new signup flag we can remove reference to SENSEI_FLOW
	const firstStepSlug = ( flow.name === SENSEI_FLOW ? steps[ 1 ] : steps[ 0 ] ).slug;
	const isFirstStep = firstStepSlug === currentStepRoute;
	const flowVariant = flow.variantSlug;
	const signupStartEventProps = flow.useSignupStartEventProps?.();
	const shouldTrack = flow.isSignupFlow && ( isFirstStep || isSignupStep );
	const flowName = flow.name;

	const extraProps = useMemo( () => {
		return {
			...signupStartEventProps,
			...( flowVariant && { flow_variant: flowVariant } ),
		};
	}, [ signupStartEventProps, flowVariant ] );

	const removeSignupParam = useCallback( () => {
		if ( queryParams.has( 'signup' ) ) {
			queryParams.delete( 'signup' );
			setQuery( queryParams );
		}
	}, [ queryParams, setQuery ] );

	useEffect( () => {
		if ( shouldTrack ) {
			recordSignupStart( flowName, ref, extraProps );
			removeSignupParam();
		}
		// We don't want to re-record the event when the extraProps or query params change.
		// Please don't add them to the dependency array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flowName, ref, removeSignupParam, shouldTrack ] );
};
