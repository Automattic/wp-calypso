import cookie from 'cookie';

const setSurveyCookie = ( name: string, value: string, maxAge: number ) => {
	document.cookie = cookie.serialize( `github-deployments-${ name }`, value, {
		path: '/',
		maxAge,
	} );
};

const getSurveyCookie = ( name: string ) => {
	return cookie.parse( document.cookie )[ `github-deployments-${ name }` ];
};

export const maybeSetDeploymentDone = () => {
	const cookieValue = getSurveyCookie( 'has-deployments' );
	if ( cookieValue ) {
		return;
	}
	setSurveyCookie( 'has-deployments', 'true', 365 * 24 * 60 * 60 ) /* 1 year */;
	setSurveyCookie( 'hide-survey', 'true', 7 * 24 * 60 * 60 ) /* 7 days */;
};

export const shouldShowDeploymentSurvey = () => {
	const cookieValue = getSurveyCookie( 'hide-survey' );
	if ( cookieValue ) {
		return false;
	}
	return true;
};
