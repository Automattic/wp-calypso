import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { matchPath } from 'react-router';

export const DEFAULT_FLOW = ONBOARDING_FLOW;

export const getFlowFromURL = ( pathname?: string, search?: string ) => {
	pathname ??= typeof window !== 'undefined' ? window.location.pathname ?? '' : '';
	search ??= typeof window !== 'undefined' ? window.location.search ?? '' : '';

	const fromPath = matchPath( { path: '/setup/:flow/*' }, pathname )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( search ).get( 'flow' );
	// Need to update this to make sure we always get the flow from the URL and its not an empty string
	return fromPath || fromQuery || '';
};

export const getStepFromURL = (
	pathname = typeof window !== 'undefined' ? window.location.pathname : ''
) => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, pathname ?? '' )?.params?.step;
	return fromPath;
};
