import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { generatePath, createPath, useMatch, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { getLoginUrlForFlow } from 'calypso/landing/stepper/hooks/use-login-url-for-flow';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
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
	const steps = 'useSteps' in flow ? flow.useSteps() : flow.__flowSteps ?? [];
	const flowName = flow.variantSlug ?? flow.name;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const stepsSlugs = steps.map( ( step ) => step.slug );
	const locale = useFlowLocale();
	const { siteId, siteSlug } = useSiteData();

	const customNavigate = useCallback< Navigate< StepperStep[] > >(
		( nextStep: string, extraData = {}, replace = false ) => {
			// If the user is not logged in, and the next step requires a logged in user, redirect to the login step.
			if (
				! isLoggedIn &&
				steps.find( ( step ) => step.slug === nextStep )?.requiresLoggedInUser
			) {
				// In-stepper auth.
				if ( flow.__experimentalUseBuiltinAuth ) {
					const signInPath = generatePath( `/:flow/:step/:lang?`, {
						flow: flowName,
						lang,
						step: PRIVATE_STEPS.USER.slug,
					} );

					// Inform the user step where to go after the user is authenticated.
					setStepData( {
						previousStep: currentStepSlug,
						nextStep,
					} );

					return navigate( signInPath );
				}
				// Classic /login auth.
				const nextStepPath = createPath( {
					// We have to include /setup, as this URL should be absolute and we can't use `useHref`.
					pathname: generatePath( `/setup/:flow/:step/:lang?`, {
						flow: flowName,
						lang,
						step: nextStep,
					} ),
					search: currentSearchParams.toString(),
					hash: window.location.hash,
				} );

				const loginUrl = getLoginUrlForFlow( {
					flow,
					locale,
					path: nextStepPath,
					siteId,
					siteSlug,
				} );

				return window.location.assign( loginUrl );
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
				flow: flowName,
				lang,
				step: nextStep,
			} );

			navigate( addQueryParams( newPath, queryParams ), { replace } );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- steps array is recreated on every render, use stepsSlugs instead.
		[
			stepsSlugs,
			isLoggedIn,
			locale,
			siteId,
			siteSlug,
			flow,
			intent,
			lang,
			navigate,
			setStepData,
			currentStepSlug,
		]
	);

	return {
		navigate: customNavigate,
		params: {
			flow: flowName,
			step: currentStepSlug,
		},
		search: currentSearchParams,
	};
};
