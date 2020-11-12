/**
 * External dependencies
 */
import type * as DomainSuggestions from '../domain-suggestions';
import type * as Plans from '../plans';
import { dispatch, select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { SITE_ID, SITE_STORE, PLANS_STORE } from './constants';
import type { LaunchStepType } from './types';

export const setSidebarFullscreen = () =>
	( {
		type: 'SET_SIDEBAR_FULLSCREEN',
	} as const );

export const unsetSidebarFullscreen = () =>
	( {
		type: 'UNSET_SIDEBAR_FULLSCREEN',
	} as const );

export const setStep = ( step: LaunchStepType ) =>
	( {
		type: 'SET_STEP',
		step,
	} as const );

export const setDomain = ( domain: DomainSuggestions.DomainSuggestion ) =>
	( {
		type: 'SET_DOMAIN',
		domain,
	} as const );

export const unsetDomain = () =>
	( {
		type: 'UNSET_DOMAIN',
	} as const );

export const confirmDomainSelection = () =>
	( {
		type: 'CONFIRM_DOMAIN_SELECTION',
	} as const );

export const setDomainSearch = ( domainSearch: string ) =>
	( {
		type: 'SET_DOMAIN_SEARCH',
		domainSearch,
	} as const );

export const setPlan = ( plan: Plans.Plan ) =>
	( {
		type: 'SET_PLAN',
		plan,
	} as const );

export const unsetPlan = () =>
	( {
		type: 'UNSET_PLAN',
	} as const );

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function* updatePlan( planSlug: Plans.PlanSlug ) {
	const plan: Plans.Plan = yield select( PLANS_STORE, 'getPlanBySlug', planSlug );
	yield setPlan( plan );
}

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function* launchSite() {
	try {
		const success = yield dispatch( SITE_STORE, 'launchSite', SITE_ID );
		return success;
	} catch ( error ) {
		// console.log( 'launch error', error );
	}
}

export const openSidebar = () =>
	( {
		type: 'OPEN_SIDEBAR',
	} as const );

export const closeSidebar = () =>
	( {
		type: 'CLOSE_SIDEBAR',
	} as const );

export const openFocusedLaunch = () =>
	( {
		type: 'OPEN_FOCUSED_LAUNCH',
	} as const );

export const closeFocusedLaunch = () =>
	( {
		type: 'CLOSE_FOCUSED_LAUNCH',
	} as const );

export const enableExperimental = () =>
	( {
		type: 'ENABLE_EXPERIMENTAL',
	} as const );

export const showSiteTitleStep = () =>
	( {
		type: 'SHOW_SITE_TITLE_STEP',
	} as const );

export type LaunchAction = ReturnType<
	| typeof unsetDomain
	| typeof setStep
	| typeof setDomain
	| typeof confirmDomainSelection
	| typeof setDomainSearch
	| typeof setPlan
	| typeof openFocusedLaunch
	| typeof closeFocusedLaunch
	| typeof unsetPlan
	| typeof openSidebar
	| typeof closeSidebar
	| typeof enableExperimental
	| typeof setSidebarFullscreen
	| typeof unsetSidebarFullscreen
	| typeof showSiteTitleStep
>;
