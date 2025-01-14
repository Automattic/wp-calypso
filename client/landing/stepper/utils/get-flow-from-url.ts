import { matchPath } from 'react-router-dom';

export const getFlowFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, window.location.pathname )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( window.location.search ).get( 'flow' );
	return fromPath || fromQuery;
};

export const getSessionIdFromURL = () => {
	const params = matchPath(
		{ path: '/setup/:flow/:step?/:lang?/:sessionId' },
		window.location.pathname
	)?.params;

	const sessionId = params?.sessionId;
	const lang = params?.lang;

	return sessionId || lang;
};

export const getStepFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, window.location.pathname )?.params
		?.step;
	return fromPath;
};
