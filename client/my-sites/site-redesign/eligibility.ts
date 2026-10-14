import { queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { fetchRedesign, fetchRedesignEligibility } from './api';
import type { AppState } from 'calypso/types';

export function useRedesignAccess() {
	const site = useSelector( getSelectedSite );
	const canDesign = useSelector(
		( state ) =>
			!! site &&
			canCurrentUser( state, site.ID, 'manage_options' ) &&
			canCurrentUser( state, site.ID, 'edit_theme_options' ) &&
			isJetpackSite( state, site.ID, { treatAtomicAsJetpackSite: false } ) === false
	);
	const enabled = isEnabled( 'themes/site-redesign' ) && !! canDesign;
	const { data, isLoading, isError } = useQuery(
		{
			queryKey: [ 'site-redesign-eligibility', site?.ID ],
			queryFn: () => fetchRedesignEligibility( site!.ID ),
			enabled,
			staleTime: 60000,
		},
		queryClient
	);
	return { site: enabled && data?.can_preview ? site : null, isLoading, isError };
}

/**
 * The site the Design Your Own card is offered for: eligible, and on a Free plan. An unknown
 * plan hides the card.
 */
export function useRedesignEligibility() {
	const { site } = useRedesignAccess();
	const isFreePlan = useSelector(
		( state: AppState ) => !! site && isCurrentPlanPaid( state, site.ID ) === false
	);
	return isFreePlan ? site : null;
}

export type RedesignRouteAccess =
	| { state: 'loading' }
	| { state: 'error' }
	| { state: 'denied' }
	| { state: 'redirect'; to: string }
	| {
			state: 'allowed';
			site: NonNullable< ReturnType< typeof getSelectedSite > >;
			/** The paid checkout-return exception: use the design already made, start nothing new. */
			applyOnly: boolean;
	  };

const REDESIGN_ID = /^rd_[0-9a-f]{32}$/;
const RESUMABLE_STATUSES = [ 'preview_ready', 'applying', 'applied' ];

/**
 * Who may open `/site-redesign/:site`. Free plans get the full redesign. Paid and unknown plans
 * go back to Themes, except when returning from the upgrade checkout to use a design they
 * already generated: `?redesign=<id>&resume=apply` naming a run the server returns for this
 * user and site, with a succeeded generation, preview and apply eligibility, and no newer run.
 * This never starts a redesign, so a paid site can't open new sessions here.
 */
export function useRedesignRouteAccess( search: string ): RedesignRouteAccess {
	const selectedSite = useSelector( getSelectedSite );
	const { site, isLoading, isError } = useRedesignAccess();
	const isPaid = useSelector( ( state: AppState ) =>
		selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null
	);
	const params = new URLSearchParams( search );
	const redesignId = params.get( 'redesign' ) ?? '';
	const isCheckoutReturn = params.get( 'resume' ) === 'apply' && REDESIGN_ID.test( redesignId );
	const checkResume = !! site && isPaid === true && isCheckoutReturn;
	const resume = useQuery(
		{
			queryKey: [ 'site-redesign-resume', site?.ID, redesignId ],
			queryFn: () => fetchRedesign( site!.ID, redesignId ),
			enabled: checkResume,
			retry: false,
			staleTime: 0,
		},
		queryClient
	);

	if ( ! selectedSite ) {
		return { state: 'loading' };
	}
	const toThemes = { state: 'redirect' as const, to: `/themes/${ selectedSite.slug }` };
	// A paid or unknown plan without a checkout return is decided by the plan alone, so it
	// never waits on, or fails with, the eligibility request.
	if ( isPaid !== false && ! isCheckoutReturn ) {
		return toThemes;
	}
	if ( isLoading ) {
		return { state: 'loading' };
	}
	if ( isError ) {
		return { state: 'error' };
	}
	if ( ! site ) {
		return { state: 'denied' };
	}
	if ( isPaid === false ) {
		return { state: 'allowed', site, applyOnly: false };
	}
	if ( ! checkResume ) {
		return toThemes;
	}
	if ( resume.isLoading ) {
		return { state: 'loading' };
	}
	const run = resume.data;
	const resumable =
		!! run &&
		run.id === redesignId &&
		run.site_id === site.ID &&
		! run.successor_id &&
		RESUMABLE_STATUSES.includes( run.status ) &&
		run.generation?.status === 'succeeded' &&
		run.eligibility.can_preview &&
		run.eligibility.can_apply;
	return resumable ? { state: 'allowed', site, applyOnly: true } : toThemes;
}
