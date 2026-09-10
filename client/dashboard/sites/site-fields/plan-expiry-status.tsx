import './style.scss';

import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { getPlanExpiryStatus } from './get-plan-expiry-status';
import type { Purchase, Site } from '@automattic/api-core';

/**
 * The site's plan subscription, if the current user is the one paying for it.
 *
 * `/me/purchases` only carries the viewer's own subscriptions, so a plan
 * somebody else owns resolves to `undefined` here even though the sites list
 * shows its name.
 */
function useSitePlanPurchase( site: Site ): Purchase | undefined {
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const productSlug = site.plan?.product_slug;

	return purchases?.find(
		( purchase ) => purchase.blog_id === site.ID && purchase.product_slug === productSlug
	);
}

/**
 * A short, colored line under the plan name for a plan that is close to
 * expiring or has already expired, linked to renewal checkout for the
 * subscriber who can do something about it. A plan that is renewing normally
 * renders nothing at all.
 */
export function PlanExpiryStatus( { site }: { site: Site } ) {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const purchase = useSitePlanPurchase( site );

	const status = getPlanExpiryStatus( site, purchase, locale );

	if ( ! status ) {
		return null;
	}

	// The event names and the first two properties are the renew nag's, which
	// this field grew out of, so that its history stays readable across the
	// change. The rest are named as the wp-admin banner names them
	// (`wpcom_expiry_notices_track_props`), so a funnel can follow the same plan
	// across both surfaces -- hence `surface` beside the older `source`, which
	// says much the same thing under the name each side already uses. `urgency`
	// is the one property neither had: wp-admin derives its colour from the day
	// count rather than choosing it.
	const eventProperties = {
		product_slug: site.plan?.product_slug,
		source: 'plan',
		surface: 'dashboard-sites-list',
		state: status.state,
		urgency: status.intent,
		is_plan_owner: !! site.plan?.user_is_owner,
		...( status.daysRemaining !== undefined && { days_remaining: status.daysRemaining } ),
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_sites_plan_renew_nag_impression"
				properties={ eventProperties }
			/>
			<Text intent={ status.intent } title={ status.href ? undefined : status.title }>
				{ status.href ? (
					<ExternalLink
						className="site-plan-expiry-status__renew-link"
						// On the link rather than the wrapper, so that it describes the
						// link to a screen reader as well as showing on hover.
						title={ status.title }
						href={ status.href }
						onClick={ () =>
							recordTracksEvent( 'calypso_dashboard_sites_plan_renew_nag_click', {
								...eventProperties,
								cta: status.cta,
							} )
						}
					>
						{ status.text }
					</ExternalLink>
				) : (
					status.text
				) }
			</Text>
		</>
	);
}
