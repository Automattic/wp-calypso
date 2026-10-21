import { wowFunnelPendingQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import { wpcomLink } from '../../utils/link';
import type { Site, WowFunnelPendingSite } from '@automattic/api-core';

/**
 * Funnels whose entry URL this link knows how to rebuild, and the one run argument that URL can
 * carry. Both mirror the onboarding flow (WOW_FUNNEL_CONFIG and getWowFunnelEntryQueryArgs() in
 * client/landing/stepper/utils/wow-funnel.ts), which the dashboard cannot import.
 *
 * They are a guard, not just a convenience. The flow resumes a run only when the entry URL names
 * that same run; a funnel it does not know starts ordinary onboarding, and an argument the URL
 * cannot express reads as a different run, whose only way forward is to discard the site. So a run
 * this cannot express gets no link at all, and the row stays as it was.
 */
const RESUMABLE_FUNNELS = [ 'default', 'blueprint' ];
const ENTRY_URL_ARGS: Record< string, string > = { blueprint_slug: 'blueprint' };

function canResumeFromEntryUrl( pending: WowFunnelPendingSite ): boolean {
	return (
		RESUMABLE_FUNNELS.includes( pending.funnel_slug ) &&
		Object.keys( pending.funnel_args ).every( ( arg ) => arg in ENTRY_URL_ARGS )
	);
}

/**
 * Is this the site a funnel built for the user before they paid for it?
 *
 * Such a site reads as being on the Free plan, when it is really waiting for the plan in its
 * owner's cart. Nothing on the site object says so, and a user has at most one, so the answer
 * comes from a single lookup shared by every row — and only asked at all when a row could be that
 * site, which for nearly every user is never.
 *
 * "Could be" means on Atomic and on the Free plan. A funnel that builds its own site starts it as
 * a Simple one and takes it Atomic a few minutes later, so for those minutes the row is not
 * recognized. Asking for every Free site instead would put the request on most users' Sites list.
 *
 * The lookup is safe to make from here. The server drops its pointer as it reads it only when the
 * site is no longer held (paid for, reverted, or its hold has lapsed), which is the same check the
 * funnel itself applies on entry.
 * @param site The site in this row.
 * @returns The held site's funnel run when this row is it and can be resumed, otherwise undefined.
 */
export function useSiteAwaitingCheckout( site: Site ): WowFunnelPendingSite | undefined {
	const couldBeAwaitingCheckout = !! site.is_wpcom_atomic && !! site.plan?.is_free;

	const { data } = useQuery( {
		...wowFunnelPendingQuery(),
		enabled: couldBeAwaitingCheckout,
	} );

	if ( ! couldBeAwaitingCheckout || ! data?.pending || data.blog_id !== site.ID ) {
		return undefined;
	}

	return canResumeFromEntryUrl( data ) ? data : undefined;
}

/**
 * Where the owner of a held site finishes buying it.
 *
 * The funnel's own entry URL, with the run's identity: entering it again resumes that run, at
 * checkout when the plan is still in the cart and at the plans step when it is not.
 * @param pending The held site's funnel run.
 * @returns The URL to send the owner to.
 */
export function getFinishSetupUrl( pending: WowFunnelPendingSite ): string {
	const query: Record< string, string > = { wow_funnel: pending.funnel_slug };

	for ( const [ arg, param ] of Object.entries( ENTRY_URL_ARGS ) ) {
		if ( pending.funnel_args[ arg ] ) {
			query[ param ] = pending.funnel_args[ arg ];
		}
	}

	return wpcomLink( addQueryArgs( '/setup/onboarding', query ) );
}

export function PlanAwaitingCheckout( { pending }: { pending: WowFunnelPendingSite } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<Text>
			<ExternalLink
				href={ getFinishSetupUrl( pending ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_dashboard_sites_plan_finish_setup_click', {
						surface: 'dashboard-sites-list',
						funnel: pending.funnel_slug,
					} )
				}
			>
				{ __( 'Finish setup' ) }
			</ExternalLink>
		</Text>
	);
}
