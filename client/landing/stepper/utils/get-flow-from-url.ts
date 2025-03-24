import { matchPath } from 'react-router-dom';

export const getFlowFromURL = (
	url = window.location.pathname,
	query = window.location.search
) => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, url )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( query ).get( 'flow' );
	// Need to update this to make sure we always get the flow from the URL and its not an empty string
	return fromPath || fromQuery || '';
};

export const getStepFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, window.location.pathname )?.params
		?.step;
	return fromPath;
};
