import config from '@automattic/calypso-config';

const CIAB_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.woo.localhost', 'my.woo.ai' ];

export function isAllowedCiabDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '-ciab.calypso.live' ) ) {
		return true;
	}

	return CIAB_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function isAllowedCiabLegacyRoute( path: string = '' ): boolean {
	const allowedStepperFlows = [
		'ai-site-builder-spec',
		'ai-site-builder',
		'woo-hosted-plans',
		'domain',
		'domain-transfer',
	];

	if ( path.startsWith( '/checkout/' ) ) {
		return true;
	}

	// Only allow specific stepper flows on CIAB.
	if ( path === '/setup' || path.startsWith( '/setup/' ) ) {
		const flow = path.split( '/' )[ 2 ];
		return allowedStepperFlows.includes( flow ?? '' );
	}

	// Disallow other routes (like /start, /setup, etc.)
	return false;
}

export function buildCiabDashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.woo.localhost:${ port }` ).href;
	}
	return new URL( path, 'https://my.woo.ai' ).href;
}
