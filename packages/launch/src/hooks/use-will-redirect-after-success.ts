/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { PLANS_STORE } from '../stores';
import LaunchContext from '../context';

/**
 * When the user has an ecommerce plan or they're using focused launch in wp-admin
 * they will be automatically redirected to /checkout after site launch.
 * This hook returns true when this is the case
 *
 * @returns boolean
 */
export function useWillRedirectAfterSuccess(): boolean {
	const { isInIframe } = React.useContext( LaunchContext );

	const locale = useLocale();

	const planProductId = useSelect(
		( select ) => select( LAUNCH_STORE ).getSelectedPlanProductId(),
		[]
	);

	const isEcommercePlan = useSelect(
		( select ) => {
			const plansStore = select( PLANS_STORE );
			const plan = plansStore.getPlanByProductId( planProductId, locale );
			return plansStore.isPlanEcommerce( plan?.periodAgnosticSlug );
		},
		[ planProductId, locale ]
	);

	return ! isInIframe || isEcommercePlan;
}
