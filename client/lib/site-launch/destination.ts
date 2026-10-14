import { isURL } from '@wordpress/url';
import { dashboardOrigins } from 'calypso/dashboard/utils/link';
import { isRelativeUrl } from 'calypso/dashboard/utils/url';
import { addQueryArgs, pathToUrl } from 'calypso/lib/url';
import type { DashboardType } from 'calypso/dashboard/app/types';

export interface LaunchParams {
	siteSlug: string;
	// The loaded site's URL. A `back_to` or `redirect_to` on its host is followed.
	siteUrl?: string | null;
	backTo?: string | null;
	redirectTo?: string | null;
	ref?: string | null;
	coupon?: string | null;
	dashboard?: string | null;
}

const DASHBOARDS: DashboardType[] = [ 'a4a', 'ciab', 'dotcom' ];

function getOrigin( url: string ) {
	try {
		return new URL( url ).origin;
	} catch {
		return null;
	}
}

/**
 * Whether `url` points at the site being launched, e.g. the wp-admin screen the launch started
 * from. The host comes from the loaded site rather than from the query, so the query can't name an
 * arbitrary host.
 */
function isOnSiteHost( url: string, siteUrl: string | null | undefined ) {
	if ( ! siteUrl ) {
		return false;
	}

	try {
		const target = new URL( url );

		return target.protocol === 'https:' && target.host === new URL( siteUrl ).host;
	} catch {
		return false;
	}
}

// The query can point anywhere, so only same-origin paths, the dashboards and the launched site are
// followed.
export function getSafeUrl( url: string | null | undefined, siteUrl?: string | null ) {
	if ( ! url ) {
		return null;
	}

	if (
		isRelativeUrl( url ) ||
		dashboardOrigins().includes( getOrigin( url ) ?? '' ) ||
		isOnSiteHost( url, siteUrl )
	) {
		return url;
	}

	return null;
}

// The wp-admin screen a launch started from, as named by its `ref`.
function getWpAdminLaunchUrl( { siteSlug, ref }: LaunchParams ) {
	const trimmedRef = ref?.trim() ?? '';

	if ( trimmedRef !== 'wp-admin' && ! trimmedRef.startsWith( 'wp-admin/' ) ) {
		return null;
	}

	return `https://${ siteSlug }/${ trimmedRef }`;
}

/**
 * Where the user came from before entering the launch flow, without the arguments that celebrate a
 * successful launch. Use this when the launch did not happen.
 */
export function getLaunchReturnUrl( params: LaunchParams ): string {
	return (
		getSafeUrl( params.backTo, params.siteUrl ) ||
		getWpAdminLaunchUrl( params ) ||
		`/home/${ params.siteSlug }`
	);
}

// wp-admin reads `celebrate-launch`, while Calypso reads `celebrateLaunch`.
function getCelebrateLaunchArgs( url: string ) {
	const { pathname } = new URL( url, 'https://wordpress.com' );

	return /\/wp-admin(\/|$)/.test( pathname )
		? { 'celebrate-launch': 'true' }
		: { celebrateLaunch: 'true' };
}

export function getLaunchDestination( params: LaunchParams ): string {
	// `redirect_to` lands the user somewhere other than where they came from once the site is live,
	// so `back_to` is free to keep meaning "the page the Back button returns to". Likewise, `ref`
	// names a wp-admin screen that celebrates the launch, while a wp-admin `back_to` can be any
	// screen.
	const url =
		getSafeUrl( params.redirectTo, params.siteUrl ) ||
		getWpAdminLaunchUrl( params ) ||
		getLaunchReturnUrl( params );

	return addQueryArgs( getCelebrateLaunchArgs( url ), url );
}

export function getLaunchCheckoutUrl( params: LaunchParams ): string {
	const destination = getLaunchDestination( params );
	const backUrl = isURL( destination ) ? destination : pathToUrl( destination );
	const dashboard = DASHBOARDS.find( ( type ) => type === params.dashboard );

	return addQueryArgs(
		{
			signup: 1,
			ref: params.ref ?? undefined,
			...( params.coupon && { coupon: params.coupon } ),
			checkoutBackUrl: addQueryArgs( { skippedCheckout: 1, celebrateLaunch: 'true' }, backUrl ),
			redirect_to: destination,
			...( dashboard && { dashboard } ),
		},
		`/checkout/${ params.siteSlug }`
	);
}
