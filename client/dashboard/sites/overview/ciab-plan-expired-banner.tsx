import { siteCurrentPlanQuery, purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useLocale } from '../../app/locale';
import { getCurrentDashboard } from '../../app/routing';
import Notice from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import { wpcomLink } from '../../utils/link';
import { isCommerceGarden } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

export function CiabPlanExpiredBanner( { site }: { site: Site } ) {
	const locale = useLocale();
	const isExpired = isCommerceGarden( site ) && site.plan?.expired;

	const { data: plan } = useQuery( {
		...siteCurrentPlanQuery( site.ID ),
		enabled: !! isExpired,
	} );
	const { data: purchase } = useQuery( {
		...purchaseQuery( plan?.id ?? 0 ),
		enabled: !! isExpired && !! plan?.id,
	} );

	if ( ! isExpired ) {
		return null;
	}

	const plansUrl = addQueryArgs( wpcomLink( '/setup/woo-hosted-plans' ), {
		siteSlug: site.slug,
		dashboard: getCurrentDashboard(),
	} );

	const gracePeriodDate = purchase?.expiry_date
		? new Date( new Date( purchase.expiry_date ).getTime() + 30 * 24 * 60 * 60 * 1000 )
		: null;
	const formattedDate = gracePeriodDate
		? formatDate( gracePeriodDate, locale, { dateStyle: 'long' } )
		: null;

	return (
		<Notice
			variant="warning"
			title={ __( 'Plan expired' ) }
			actions={
				<Button variant="primary" href={ plansUrl }>
					{ __( 'Get a plan' ) }
				</Button>
			}
		>
			{ formattedDate
				? sprintf(
						/* translators: %s is the date by which the user must purchase a plan */
						__(
							'The store is no longer active since the plan has expired. Purchase a plan before %s to keep your store or it will be permanently deleted.'
						),
						formattedDate
				  )
				: __(
						'The store is no longer active since the plan has expired. Purchase a plan to keep your store or it will be permanently deleted.'
				  ) }
		</Notice>
	);
}
