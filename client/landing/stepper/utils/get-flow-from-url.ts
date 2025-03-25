export const getFlowFromURL = (
	url = window.location.pathname,
	query = window.location.search
) => {
	const fullUrl = new URL( url, 'http://wordpress.com' ); // Base URL needed for pathname-only strings
	const [ stepper, flow ] = fullUrl.pathname.split( '/' ).filter( Boolean );
	const fromPath = stepper === 'setup' ? flow : undefined;

	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( query ).get( 'flow' );
	// Need to update this to make sure we always get the flow from the URL and its not an empty string
	return fromPath || fromQuery || '';
};

export const getStepFromURL = ( url = window.location.pathname ) => {
	const fullUrl = new URL( url, 'http://wordpress.com' ); // Base URL needed for pathname-only strings
	const [ stepper, flow, step ] = fullUrl.pathname.split( '/' ).filter( Boolean );

	if ( stepper !== 'setup' || ! flow || ! step ) {
		return undefined;
	}

	return step;
};
