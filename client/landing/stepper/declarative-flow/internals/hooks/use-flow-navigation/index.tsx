import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { generatePath, useMatch, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ONBOARD_STORE, STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { Navigate, StepperStep } from '../../types';

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
export const useFlowNavigation = (): FlowNavigation => {
	const intent = useOnboardingIntent();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const navigate = useNavigate();
	const match = useMatch( '/:flow/:step?/:lang?' );
	const { flow = null, step: currentStepSlug = null, lang = null } = match?.params || {};
	const [ currentSearchParams ] = useSearchParams();

	const customNavigate = useCallback< Navigate< StepperStep[] > >(
		( nextStep: string, extraData = {}, replace = false ) => {
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
				flow,
				lang,
				step: nextStep,
			} );

			navigate( addQueryParams( newPath, queryParams ), { replace } );
		},
		[ flow, intent, lang, navigate, setStepData, currentStepSlug ]
	);

	return {
		navigate: customNavigate,
		params: {
			flow,
			step: currentStepSlug,
		},
		search: currentSearchParams,
	};
};
