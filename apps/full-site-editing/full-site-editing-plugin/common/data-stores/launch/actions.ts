/**
 * External dependencies
 */
import type { DomainSuggestions, Plans } from '@automattic/data-stores';
import { dispatch, select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { SITE_ID, SITE_STORE, PLANS_STORE } from './constants';

export const setDomain = ( domain: DomainSuggestions.DomainSuggestion ) => ( {
	type: 'SET_DOMAIN' as const,
	domain,
} );

export const setDomainSearch = ( domainSearch: string ) => ( {
	type: 'SET_DOMAIN_SEARCH' as const,
	domainSearch,
} );

export const setPlan = ( plan: Plans.Plan ) => ( {
	type: 'SET_PLAN' as const,
	plan,
} );

export function* updatePlan( planSlug: Plans.PlanSlug ) {
	const plan: Plans.Plan = yield select( PLANS_STORE, 'getPlanBySlug', planSlug );
	yield setPlan( plan );
}

export function* launchSite() {
	try {
		const success = yield dispatch( SITE_STORE, 'launchSite', SITE_ID );
		return success;
	} catch ( error ) {
		// console.log( 'launch error', error );
	}
}

export type LaunchAction = ReturnType< typeof setDomain | typeof setDomainSearch | typeof setPlan >;
