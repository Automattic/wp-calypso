/**
 * External dependencies
 */
import { findKey } from 'lodash';
import { generatePath, useLocation, useRouteMatch } from 'react-router-dom';
import { Plans } from '@automattic/data-stores';
import type { ValuesType } from 'utility-types';

import { getLanguageRouteParam } from '../../lib/i18n-utils';

const plansPaths = Plans.plansPaths;

// The first step (IntentGathering), which is found at the root route (/), is set as
// `undefined`, as that's what matching our `path` pattern against a route with no explicit
// step fragment will return.
export const Step = {
	IntentGathering: undefined,
	DesignSelection: 'design',
	Style: 'style',
	Features: 'features',
	Signup: 'signup',
	Login: 'login',
	CreateSite: 'create-site',
	Domains: 'domains',
	Plans: 'plans',
	DomainsModal: 'domains-modal',
	PlansModal: 'plans-modal',
	LanguageModal: 'language-modal',
} as const;

// We remove falsey `steps` with `.filter( Boolean )` as they'd mess up our |-separated route pattern.
export const steps = Object.values( Step ).filter( Boolean );

const routeFragments = {
	// We add the possibility of an empty step fragment through the `?` question mark at the end of that fragment.
	step: `:step(${ steps.join( '|' ) })?`,
	plan: `:plan(${ plansPaths.join( '|' ) })?`,
	lang: getLanguageRouteParam(),
};

export const path = [ '', ...Object.values( routeFragments ) ].join( '/' );

export type StepType = ValuesType< typeof Step >;
export type StepNameType = keyof typeof Step;

export interface GutenLocationStateType {
	anchorFmPodcastId?: string;
}

export function usePath() {
	const langParam = useLangRouteParam();
	const planParam = usePlanRouteParam();

	return ( step?: StepType, lang?: string, plan?: string ) => {
		// When lang is null, remove lang.
		// When lang is empty or undefined, get lang from route param.
		lang = lang === null ? '' : lang || langParam;
		plan = plan === null ? '' : plan || planParam;

		if ( ! step && ! lang && ! plan ) {
			return '/';
		}

		try {
			return generatePath( path, {
				step,
				plan,
				lang,
			} );
		} catch {
			// If we get an invalid lang or plan, `generatePath` throws a TypeError.
			return generatePath( path, { step } );
		}
	};
}

export function useLangRouteParam() {
	const match = useRouteMatch< { lang?: string } >( path );
	return match?.params.lang;
}

export function useStepRouteParam() {
	const match = useRouteMatch< { step?: string } >( path );
	return match?.params.step as StepType;
}

export function usePlanRouteParam() {
	const match = useRouteMatch< { plan?: string } >( path );
	return match?.params.plan;
}

export function useCurrentStep() {
	const stepRouteParam = useStepRouteParam();
	return findKey( Step, ( step ) => step === stepRouteParam ) as StepNameType;
}

// Returns true if the url has a `?new`, which is used by the
// CreateSite step to decide whether a site creation needs to
// be triggered.
export function useNewQueryParam() {
	return new URLSearchParams( useLocation().search ).has( 'new' );
}

export function useIsAnchorFm(): boolean {
	const podcastId = useAnchorFmPodcastId();
	return podcastId !== null && podcastId !== '';
}

// Returns the anchor podcast id. First looks in "location state",
// provided by react-router-dom, if not available there, checks the query string.
export function useAnchorFmPodcastId(): string | null {
	const { state, search } = useLocation< GutenLocationStateType >();

	// Use location state if available
	if ( state && state.anchorFmPodcastId ) {
		return state.anchorFmPodcastId;
	}

	// Fall back to looking in query param
	const queryParam = new URLSearchParams( search ).get( 'anchor_podcast' );
	if ( queryParam !== null && queryParam !== '' ) {
		return queryParam;
	}
	return null;
}
