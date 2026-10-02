import { isURL } from '@wordpress/url';
import { dashboardOrigins } from 'calypso/dashboard/utils/link';
import { isRelativeUrl } from 'calypso/dashboard/utils/url';
import { addQueryArgs, pathToUrl } from 'calypso/lib/url';
import type { DashboardType } from 'calypso/dashboard/app/types';

export interface LaunchParams {
	siteSlug: string;
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

// The query can point anywhere, so only same-origin paths and the dashboards are followed.
function getSafeUrl( url: string | null | undefined ) {
	if ( ! url ) {
		return null;
	}

	if ( isRelativeUrl( url ) || dashboardOrigins().includes( getOrigin( url ) ?? '' ) ) {
		return url;
	}

	return null;
}

function getLaunchReturnTarget( { siteSlug, backTo: unsafeBackTo, ref }: LaunchParams ) {
	const backTo = getSafeUrl( unsafeBackTo );

	if ( backTo ) {
		return { url: backTo, celebrateArgs: { celebrateLaunch: 'true' } };
	}

	const trimmedRef = ref?.trim() ?? '';

	if ( trimmedRef === 'wp-admin' || trimmedRef.startsWith( 'wp-admin/' ) ) {
		return {
			url: `https://${ siteSlug }/${ trimmedRef }`,
			celebrateArgs: { 'celebrate-launch': 'true' },
		};
	}

	return { url: `/home/${ siteSlug }`, celebrateArgs: { celebrateLaunch: 'true' } };
}

/**
 * Where the user came from before entering the launch flow, without the arguments that celebrate a
 * successful launch. Use this when the launch did not happen.
 */
export function getLaunchReturnUrl( params: LaunchParams ): string {
	return getLaunchReturnTarget( params ).url;
}

export function getLaunchDestination( params: LaunchParams ): string {
	// `redirect_to` lands the user somewhere other than where they came from once the site is live,
	// so `back_to` is free to keep meaning "the page the Back button returns to".
	const redirectTo = getSafeUrl( params.redirectTo );

	if ( redirectTo ) {
		return addQueryArgs( { celebrateLaunch: 'true' }, redirectTo );
	}

	const { url, celebrateArgs } = getLaunchReturnTarget( params );

	return addQueryArgs( celebrateArgs, url );
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
