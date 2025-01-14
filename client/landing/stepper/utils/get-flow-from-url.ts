import { matchPath } from 'react-router-dom';

export const getFlowFromURL = ( url = window.location.pathname ) => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, url )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( window.location.search ).get( 'flow' );
	return fromPath || fromQuery;
};

export const getSessionIdFromURL = ( url = window.location.pathname ) => {
	const params = matchPath( { path: '/setup/:flow/:step?/:sessionId/:lang?' }, url )?.params;

	const sessionId = params?.sessionId?.startsWith( '~' ) ? params?.sessionId : null;
	const lang = params?.lang?.startsWith( '~' ) ? params?.lang : null;

	return sessionId || lang;
};

export const getStepFromURL = ( url = window.location.pathname ) => {
	const fromPath = matchPath( { path: '/setup/:flow/:step' }, url )?.params?.step;
	return fromPath;
};
