import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
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
		lang: string | null;
	};
	search: URLSearchParams;
}
//TODO: Check why we need the stepPaths because there is no reference to it in the codebase.
// If we don't need it, we might call this hook directly from the flow files, instead of drilling the navigate function, reducing the complexity and rerenders.
/**
 *  Hook to manage the navigation between steps in the flow
 * @param stepPaths
 * @returns
 */

export const useFlowNavigation = ( stepPaths: string[] ): FlowNavigation => {
	const intent = useOnboardingIntent();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const navigate = useNavigate();
	const match = useMatch( '/:flow/:step/:lang?' );
	const { flow = null, step: currentStep = null, lang = null } = match?.params || {};
	const [ currentSearchParams ] = useSearchParams();

	const customNavigate: Navigate< StepperStep[] > = ( nextStep: string, extraData = {} ) => {
		const hasQueryParams = nextStep.includes( '?' );

		const queryParams = ! hasQueryParams ? currentSearchParams : null;

		setStepData( {
			path: nextStep,
			intent: intent,
			previousStep: currentStep,
			...extraData,
		} );

		const newPath = generatePath( `/:flow/:step/:lang?`, {
			flow,
			lang,
			step: nextStep,
		} );

		navigate( addQueryParams( newPath, queryParams ), { state: stepPaths } );
	};

	return {
		navigate: customNavigate,
		params: {
			flow,
			step: currentStep,
			lang,
		},
		search: currentSearchParams,
	};
};
