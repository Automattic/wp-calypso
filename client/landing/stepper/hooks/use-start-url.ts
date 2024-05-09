import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useLoginUrl } from '../utils/path';

export const useStartUrl = ( flowName: string ) => {
	const locale = useFlowLocale();

	const currentQueryParams = new URLSearchParams( window.location.search );
	const aff = currentQueryParams.get( 'aff' );
	const vendorId = currentQueryParams.get( 'vid' );

	let hasFlowParams = false;
	const flowParams = new URLSearchParams();
	const queryParams = new URLSearchParams();

	if ( vendorId ) {
		queryParams.set( 'vid', vendorId );
	}

	if ( aff ) {
		queryParams.set( 'aff', aff );
	}

	if ( locale && locale !== 'en' ) {
		flowParams.set( 'locale', locale );
		hasFlowParams = true;
	}

	const redirectTarget =
		`/setup/${ flowName }` +
		( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

	let queryString = `redirect_to=${ redirectTarget }`;

	if ( queryParams.toString() ) {
		queryString = `${ queryString }&${ queryParams.toString() }`;
	}

	const logInUrl = useLoginUrl( {
		variationName: flowName,
	} );

	return `${ logInUrl }&${ queryString }`;
};
