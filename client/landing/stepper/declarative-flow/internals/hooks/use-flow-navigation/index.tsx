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
import type { Flow, Navigate } from '../../types';

const useOnboardingIntent = () => {
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	return intent;
};

interface FlowNavigation {
	navigate: Navigate;
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

	const customNavigate = useCallback< Navigate >(
		( nextStep: string, extraData = {}, replace = false ) => {
			// If the user is not logged in, and the next step requires a logged in user, redirect to the login step.
			if (
				! isLoggedIn &&
				steps.find( ( step ) => step.slug === nextStep )?.requiresLoggedInUser
			) {
				// In-stepper auth.
				if ( flow.__experimentalUseBuiltinAuth ) {
					const signInPath = createPath( {
						pathname: generatePath( '/:flow/:step/:lang?', {
							flow: flowName,
							lang,
							step: PRIVATE_STEPS.USER.slug,
						} ),
						search: currentSearchParams.toString(),
						hash: window.location.hash,
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
					pathname: generatePath( '/setup/:flow/:step/:lang?', {
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

			setStepData( {
				path: nextStep,
				intent: intent,
				previousStep: currentStepSlug,
				...extraData,
			} );

			const currentQueryParams = new URLSearchParams( window.location.search );
			const stepQueryParams = nextStep.includes( '?' )
				? new URLSearchParams( nextStep.split( '?' )[ 1 ] )
				: [];

			// Merge the current and step query params. Give precedence to the step query params because they're new and more deliberate.
			const queryParams = new URLSearchParams( {
				...Object.fromEntries( currentQueryParams ),
				...Object.fromEntries( stepQueryParams ),
			} );

			const newPath = createPath( {
				pathname: generatePath( '/:flow/:step/:lang?', {
					flow: flowName,
					lang,
					step: nextStep.split( '?' )[ 0 ],
				} ),
				search: queryParams.toString(),
				hash: window.location.hash,
			} );

			navigate( newPath, { replace } );
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
