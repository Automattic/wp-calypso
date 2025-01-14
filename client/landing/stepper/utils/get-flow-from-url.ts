import { matchPath } from 'react-router-dom';

export const getFlowFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, window.location.pathname )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( window.location.search ).get( 'flow' );
	return fromPath || fromQuery;
};

export const getSessionIdFromURL = () => {
	const params = matchPath(
		{ path: '/setup/:flow/:step?/:sessionId/:lang?' },
		window.location.pathname
	)?.params;

	const sessionId = params?.sessionId?.startsWith( '~' ) ? params?.sessionId : null;
	const lang = params?.lang?.startsWith( '~' ) ? params?.lang : null;

	return sessionId || lang;
};

export const getStepFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, window.location.pathname )?.params
		?.step;
	return fromPath;
};
