/**
 * External dependencies
 */
import { generatePath, useRouteMatch } from 'react-router-dom';
import { getLanguageRouteParam } from '../../lib/i18n-utils';
import { ValuesType } from 'utility-types';

// The first step (IntentGathering), which is found at the root route (/), is set as
// `undefined`, as that's what matching our `path` pattern against a route with no explicit
// step fragment will return.
export const Step = {
	IntentGathering: undefined,
	DesignSelection: 'design',
	PageSelection: 'pages',
	Signup: 'signup',
	Login: 'login',
	CreateSite: 'create-site',
} as const;

// We remove falsey `steps` with `.filter( Boolean )` as they'd mess up our |-separated route pattern.
export const steps = Object.values( Step ).filter( Boolean );

// We add back the possibility of an empty step fragment through the `?` question mark at the end of that fragment.
export const path = `/:step(${ steps.join( '|' ) })?/${ getLanguageRouteParam() }`;

export type StepType = ValuesType< typeof Step >;

export function usePath() {
	const langParam = useLangRouteParam();

	return ( step?: StepType, lang?: string ) => {
		// When lang is null, remove lang.
		// When lang is empty or undefined, get lang from route param.
		lang = lang === null ? '' : lang || langParam;

		if ( ! step && ! lang ) {
			return '/';
		}

		try {
			return generatePath( path, {
				step,
				lang,
			} );
		} catch {
			// If we get an invalid lang, `generatePath` throws a TypeError.
			return generatePath( path, { step } );
		}
	};
}

export function useLangRouteParam() {
	const match = useRouteMatch< { lang?: string } >( path );
	return match?.params.lang;
}
