import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../../utils/link';
import { getPlanChangeReturnUrls, getWpcomPlanChangeUrl } from '../../../utils/site-url';
import type { Purchase } from '@automattic/api-core';

/**
 * The card or offer that sent the user, recorded as `ref=cancel-flow-<id>`.
 */
type CancelFlowPlanChangeRef =
	'change-plan' | 'switch-to-monthly' | 'downgrade-personal' | 'downgrade-monthly';

/**
 * Purchase Settings' plan-change link with `ref` added, falling back to bare
 * `/plans/<site>`.
 */
export function getCancelFlowPlanChangeUrl(
	purchase: Purchase,
	refId: CancelFlowPlanChangeRef
): string {
	const url = getWpcomPlanChangeUrl( purchase, getPlanChangeReturnUrls( purchase ) );
	if ( ! url ) {
		return wpcomLink( `/plans/${ purchase.site_slug }` );
	}
	return addQueryArgs( url, { ref: `cancel-flow-${ refId }` } );
}
