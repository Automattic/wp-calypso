import { useLocale } from '@automattic/i18n-utils';
import { getLocaleFromPathname, getLocaleFromQueryParam } from 'calypso/boot/locale';
import { getLoginUrl } from '../utils/path';

export const useStartUrl = ( flowName: string ) => {
	const useLocaleSlug = useLocale();
	// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
	const queryLocaleSlug = getLocaleFromQueryParam();
	const pathLocaleSlug = getLocaleFromPathname();
	const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

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

	const logInUrl = getLoginUrl( {
		variationName: flowName,
		locale,
	} );

	return `${ logInUrl }&${ queryString }`;
};
