/* eslint-disable no-restricted-imports */
import { siteByIdQuery, siteDomainsQuery, siteLaunchMutation } from '@automattic/api-queries';
import {
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { MasterbarLaunchButtonView } from 'calypso/layout/masterbar/masterbar-launch-button';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

// Plans that exclude a site from the Big Sky trial classification. Kept in
// sync with `client/state/sites/plans/selectors/is-site-big-sky-trial.ts`.
const NON_BIG_SKY_PLANS = [
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
];

function addCelebrateLaunchQueryParams() {
	const url = new URL( window.location.href );
	url.searchParams.set( 'celebrateLaunch', 'true' );
	window.history.replaceState( {}, '', url.toString() );
}

/**
 * Dashboard container for the shared `MasterbarLaunchButtonView`. Sources site
 * and domain data from TanStack Query and mirrors the branching behavior of
 * the classic `launchSiteOrRedirectToLaunchSignupFlow` thunk so the dashboard
 * and classic masterbars behave identically on click.
 *
 * TODO: Dashboard does not yet render a post-launch celebration modal. The
 * classic masterbar flow adds `?celebrateLaunch=true` to the URL and a
 * Calypso page elsewhere reads it to show a modal. Revisit once the dashboard
 * has an equivalent surface.
 */
export function OmnibarLaunchButton( { siteId }: { siteId: number } ) {
	const queryClient = useQueryClient();
	const { data: site } = useQuery( siteByIdQuery( siteId ) );
	const { data: domains } = useQuery( siteDomainsQuery( siteId ) );
	const launchMutation = useMutation( siteLaunchMutation( siteId ) );

	const onSiteLaunched = ( isWpcomAtomic: boolean ) => {
		addCelebrateLaunchQueryParams();
		queryClient.invalidateQueries( { queryKey: siteByIdQuery( siteId ).queryKey } );
		if ( isWpcomAtomic ) {
			updateLaunchpadSettings( siteId, {
				checklist_statuses: { site_launched: true },
			} );
		}
	};

	const onDefaultLaunch = () => {
		if ( site?.launch_status !== 'unlaunched' ) {
			return;
		}

		const productSlug = site.plan?.product_slug;
		const isPaid = site.plan ? ! site.plan.is_free : false;
		const hasMultipleDomains = ( domains?.length ?? 0 ) > 1;
		const isHostingTrial = productSlug === PLAN_HOSTING_TRIAL_MONTHLY;

		if ( ( isPaid && hasMultipleDomains ) || isHostingTrial ) {
			launchMutation.mutate( undefined, {
				onSuccess: () => onSiteLaunched( !! site.is_wpcom_atomic ),
			} );
			return;
		}

		const isBigSkyTrial =
			site.options?.site_creation_flow === 'ai-site-builder' &&
			( ! productSlug || ! NON_BIG_SKY_PLANS.includes( productSlug ) );

		if ( isBigSkyTrial ) {
			window.location.href = addQueryArgs( '/setup/ai-site-builder/domains', {
				siteId,
				source: null,
				redirect: 'site-launch',
				new: null,
				search: null,
			} );
			return;
		}

		window.location.href = addQueryArgs( '/start/launch-site', {
			siteSlug: site.slug,
			source: null,
			hide_initial_query: 'yes',
			new: null,
			search: null,
		} );
	};

	return (
		<MasterbarLaunchButtonView
			siteId={ siteId }
			siteSlug={ site?.slug }
			isWpcomAtomic={ !! site?.is_wpcom_atomic }
			trackingSource="dashboard"
			recordTracks={ ( name, props ) => recordTracksEvent( name, props ) }
			onDefaultLaunch={ onDefaultLaunch }
			onSiteLaunched={ onSiteLaunched }
		/>
	);
}
