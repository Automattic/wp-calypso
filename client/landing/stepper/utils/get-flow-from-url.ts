import { matchPath } from 'react-router';

export const getFlowFromURL = (
	pathname = window.location.pathname ?? '',
	search = window.location.search
) => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, pathname )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( search ).get( 'flow' );
	// Need to update this to make sure we always get the flow from the URL and its not an empty string
	return fromPath || fromQuery || '';
};

export const getStepFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, window.location.pathname )?.params
		?.step;
	return fromPath;
};
