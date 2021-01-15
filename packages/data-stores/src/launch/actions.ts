/**
 * External dependencies
 */
import type * as DomainSuggestions from '../domain-suggestions';

/**
 * Internal dependencies
 */
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

export const setSiteTitle = ( title: string ) =>
	( {
		type: 'SET_SITE_TITLE',
		title,
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

export const setPlanProductId = ( planProductId: number | undefined ) =>
	( {
		type: 'SET_PLAN_PRODUCT_ID',
		planProductId,
	} as const );

export const unsetPlanProductId = () =>
	( {
		type: 'UNSET_PLAN_PRODUCT_ID',
	} as const );

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function* updatePlan( planProductId: number | undefined ) {
	yield setPlanProductId( planProductId );
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

export const setModalDismissible = () =>
	( {
		type: 'SET_MODAL_DISMISSIBLE',
	} as const );

export const unsetModalDismissible = () =>
	( {
		type: 'UNSET_MODAL_DISMISSIBLE',
	} as const );

export const showModalTitle = () =>
	( {
		type: 'SHOW_MODAL_TITLE',
	} as const );

export const hideModalTitle = () =>
	( {
		type: 'HIDE_MODAL_TITLE',
	} as const );

export const enablePersistentSuccessView = () =>
	( {
		type: 'ENABLE_SUCCESS_VIEW',
	} as const );

export const disablePersistentSuccessView = () =>
	( {
		type: 'DISABLE_SUCCESS_VIEW',
	} as const );

export type LaunchAction = ReturnType<
	| typeof setSiteTitle
	| typeof unsetDomain
	| typeof setStep
	| typeof setDomain
	| typeof confirmDomainSelection
	| typeof setDomainSearch
	| typeof setPlanProductId
	| typeof openFocusedLaunch
	| typeof closeFocusedLaunch
	| typeof unsetPlanProductId
	| typeof openSidebar
	| typeof closeSidebar
	| typeof enableExperimental
	| typeof setSidebarFullscreen
	| typeof unsetSidebarFullscreen
	| typeof showSiteTitleStep
	| typeof setModalDismissible
	| typeof unsetModalDismissible
	| typeof showModalTitle
	| typeof hideModalTitle
	| typeof enablePersistentSuccessView
	| typeof disablePersistentSuccessView
>;
