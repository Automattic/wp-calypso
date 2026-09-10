import './style.scss';

import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { arrowUpRight } from '@wordpress/icons';
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

	const eventProperties = {
		product_slug: site.plan?.product_slug,
		source: 'plan',
		urgency: status.intent,
		has_renew_link: !! status.href,
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_sites_plan_renew_nag_impression"
				properties={ eventProperties }
			/>
			<Text intent={ status.intent } title={ status.href ? undefined : status.title }>
				{ status.href ? (
					<a
						className="site-plan-expiry-status__renew-link"
						// On the link rather than the wrapper, so that it describes the
						// link to a screen reader as well as showing on hover.
						title={ status.title }
						href={ status.href }
						onClick={ () =>
							recordTracksEvent( 'calypso_dashboard_sites_plan_renew_nag_click', eventProperties )
						}
					>
						{ status.text }
						<Icon icon={ arrowUpRight } size={ 18 } />
					</a>
				) : (
					status.text
				) }
			</Text>
		</>
	);
}
