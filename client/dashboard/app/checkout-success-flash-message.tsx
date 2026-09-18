import { siteByIdQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { getSitePlanDisplayName } from '../utils/site-plan';

/**
 * Flash id used to show a post-checkout success snackbar when the checkout
 * pending page redirects the user back into the Dashboard. The checkout side
 * imports this constant and tags the redirect URL with `?flash=<id>` (see
 * `client/my-sites/checkout/checkout-thank-you/pending/index.tsx`).
 *
 * Rendered in the app shell (`app/root`) so the toast appears regardless of
 * which Dashboard page checkout redirects to (site overview, sites list,
 * billing purchases, etc.).
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

/**
 * Set alongside the flash id when the order included a new plan, so the toast
 * can name the plan that is now active.
 */
export const CHECKOUT_SUCCESS_PLAN_SITE_ID_PARAM = 'plan_site_id';

export function CheckoutSuccessFlashMessage() {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const queryClient = useQueryClient();

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'flash' ) !== CHECKOUT_SUCCESS_FLASH_ID ) {
			return;
		}
		const planSiteId = Number( params.get( CHECKOUT_SUCCESS_PLAN_SITE_ID_PARAM ) );

		params.delete( 'flash' );
		params.delete( CHECKOUT_SUCCESS_PLAN_SITE_ID_PARAM );
		const search = params.toString();
		window.history.replaceState(
			window.history.state,
			'',
			window.location.pathname + ( search ? `?${ search }` : '' ) + window.location.hash
		);

		// `fetchQuery` rather than cached data: the persisted cache can still hold
		// the site's pre-purchase plan.
		const planName = planSiteId
			? queryClient
					.fetchQuery( siteByIdQuery( planSiteId ) )
					.then( getSitePlanDisplayName )
					.catch( () => '' )
			: Promise.resolve( '' );

		planName.then( ( name ) => {
			createSuccessNotice(
				name
					? sprintf(
							/* translators: %(planName)s is the name of the plan, e.g. "Business" */
							__( "You're in! The %(planName)s Plan is now active." ),
							{ planName: name }
					  )
					: __( 'Your purchase was completed.' ),
				{ type: 'snackbar' }
			);
		} );
	}, [ createSuccessNotice, queryClient ] );

	return null;
}
