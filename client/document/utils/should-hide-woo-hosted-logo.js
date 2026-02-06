import { WOO_HOSTED_PLANS_FLOW } from '@automattic/onboarding';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';

export function shouldHideWooHostedLogo( path = '' ) {
	const { pathname, search, searchParams } = getPathDetails( path );

	if ( pathname.startsWith( '/setup' ) ) {
		return getFlowFromURL( pathname, search ) === WOO_HOSTED_PLANS_FLOW;
	}

	if ( pathname.startsWith( '/checkout' ) ) {
		if ( isWooHostedCheckoutSlug( pathname ) ) {
			return true;
		}

		const redirectTo = searchParams.get( 'redirect_to' ) || '';
		const cancelTo = searchParams.get( 'cancel_to' ) || '';

		return [ redirectTo, cancelTo ].some( ( target ) => isWooHostedRedirect( target ) );
	}

	return false;
}

function isWooHostedRedirect( redirectTo ) {
	if ( ! redirectTo ) {
		return false;
	}

	const { pathname, search } = new URL( redirectTo, 'http://example.com' );
	return getFlowFromURL( pathname, search ) === WOO_HOSTED_PLANS_FLOW;
}

function isWooHostedCheckoutSlug( pathname ) {
	const [ , checkoutSiteSlug = '', checkoutPlanSlug = '' ] = pathname.split( '/' ).slice( 1 );
	return (
		isWooHostedPlanSlug( checkoutPlanSlug ) || checkoutSiteSlug.endsWith( '.commerce-garden.com' )
	);
}

function isWooHostedPlanSlug( planSlug ) {
	return planSlug.startsWith( 'woo_hosted_' );
}

function getPathDetails( path ) {
	try {
		const url = new URL( path, 'http://example.com' );
		return { pathname: url.pathname, search: url.search, searchParams: url.searchParams };
	} catch {
		return {
			pathname: path,
			search: '',
			searchParams: new URLSearchParams(),
		};
	}
}
