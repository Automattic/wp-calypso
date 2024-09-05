import { SENSEI_FLOW } from '@automattic/onboarding';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import { type Flow } from '../../types';
import useDisposableEffect from '../use-disposable-effect';

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

	const recordStart = useCallback( () => {
		recordSignupStart( flowName, ref, extraProps );
		removeSignupParam();
	}, [ extraProps, flowName, ref, removeSignupParam ] );

	useDisposableEffect(
		( dispose ) => {
			if ( shouldTrack ) {
				recordStart();
				dispose();
			}
		},
		[ recordStart, shouldTrack ]
	);
};
