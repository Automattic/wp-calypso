import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { generatePath, useMatch, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ONBOARD_STORE, STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { PRIVATE_STEPS } from '../../steps';
import type { Flow, Navigate, StepperStep } from '../../types';

const useOnboardingIntent = () => {
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	return intent;
};

const addQueryParams = ( uri: string, params?: URLSearchParams | null ) => {
	if ( params ) {
		return uri + '?' + params.toString();
	}
	return uri;
};

interface FlowNavigation {
	navigate: Navigate< StepperStep[] >;
	params: {
		flow: string | null;
		step: string | null;
	};
	search: URLSearchParams;
}

/**
 *  Hook to manage the navigation between steps in the flow
 */
export const useFlowNavigation = ( flow: Flow ): FlowNavigation => {
	const intent = useOnboardingIntent();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const navigate = useNavigate();
	const match = useMatch( '/:flow/:step?/:lang?' );
	const { step: currentStepSlug = null, lang = null } = match?.params || {};
	const [ currentSearchParams ] = useSearchParams();
	const steps = flow.useSteps();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const stepsSlugs = steps.map( ( step ) => step.slug );

	const customNavigate = useCallback< Navigate< StepperStep[] > >(
		( nextStep: string, extraData = {}, replace = false ) => {
			// If the user is not logged in, and the next step requires a logged in user, redirect to the login step.
			if (
				! isLoggedIn &&
				flow.__experimentalUseBuiltinAuth &&
				steps.find( ( step ) => step.slug === nextStep )?.requiresLoggedInUser
			) {
				setStepData( {
					intent: intent,
					previousStep: currentStepSlug,
					nextStep,
				} );
				const signInPath = generatePath( `/:flow/:step/:lang?`, {
					flow: flow.name,
					lang,
					step: PRIVATE_STEPS.USER.slug,
				} );

				return navigate( signInPath, { replace: true } );
			}

			const hasQueryParams = nextStep.includes( '?' );

			// Get the latest search params from the current location
			const queryParams = ! hasQueryParams ? new URLSearchParams( window.location.search ) : null;

			setStepData( {
				path: nextStep,
				intent: intent,
				previousStep: currentStepSlug,
				...extraData,
			} );

			const newPath = generatePath( `/:flow/:step/:lang?`, {
				flow: flow.name,
				lang,
				step: nextStep,
			} );

			navigate( addQueryParams( newPath, queryParams ), { replace } );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- steps array is recreated on every render, use stepsSlugs instead.
		[ isLoggedIn, stepsSlugs, flow, intent, lang, navigate, setStepData, currentStepSlug ]
	);

	return {
		navigate: customNavigate,
		params: {
			flow: flow.name,
			step: currentStepSlug,
		},
		search: currentSearchParams,
	};
};
