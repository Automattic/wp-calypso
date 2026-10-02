import { isURL } from '@wordpress/url';
import { addQueryArgs, pathToUrl } from 'calypso/lib/url';

export interface LaunchParams {
	siteSlug: string;
	backTo?: string | null;
	redirectTo?: string | null;
	ref?: string | null;
	coupon?: string | null;
	dashboard?: string | null;
}

function getLaunchReturnTarget( { siteSlug, backTo, ref }: LaunchParams ) {
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
	if ( params.redirectTo ) {
		return addQueryArgs( { celebrateLaunch: 'true' }, params.redirectTo );
	}

	const { url, celebrateArgs } = getLaunchReturnTarget( params );

	return addQueryArgs( celebrateArgs, url );
}

export function getLaunchCheckoutUrl( params: LaunchParams ): string {
	const destination = getLaunchDestination( params );
	const backUrl = isURL( destination ) ? destination : pathToUrl( destination );

	return addQueryArgs(
		{
			signup: 1,
			ref: params.ref ?? undefined,
			...( params.coupon && { coupon: params.coupon } ),
			checkoutBackUrl: addQueryArgs( { skippedCheckout: 1, celebrateLaunch: 'true' }, backUrl ),
			redirect_to: destination,
			...( params.dashboard && { dashboard: params.dashboard } ),
		},
		`/checkout/${ params.siteSlug }`
	);
}
