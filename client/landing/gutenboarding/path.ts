/**
 * External dependencies
 */
import { generatePath, useRouteMatch } from 'react-router-dom';
import { getLanguageSlugs } from '../../lib/i18n-utils';
import { ValuesType } from 'utility-types';

// The first step (IntentGathering), which is found at the root route (/), is set as
// `undefined`, as that's what matching our `path` pattern against a route with no explicit
// step fragment will return.
export const Step = {
	IntentGathering: undefined,
	DesignSelection: 'design',
	PageSelection: 'pages',
	Signup: 'signup',
	CreateSite: 'create-site',
} as const;

export const langs: string[] = getLanguageSlugs();
// We remove falsey `steps` with `.filter( Boolean )` as they'd mess up our |-separated route pattern.
export const steps = Object.values( Step ).filter( Boolean );

// We add back the possibility of an empty step fragment through the `?` question mark at the end of that fragment.
export const path = `/:step(${ steps.join( '|' ) })?/:lang(${ langs.join( '|' ) })?`;

export type StepType = ValuesType< typeof Step >;

export function usePath() {
	const match = useRouteMatch< { lang?: string } >( path );

	return ( step?: StepType, lang?: string ) => {
		// When lang is null, remove lang.
		// When lang is empty or undefined, get lang from route param.
		lang = lang === null ? '' : lang || match?.params.lang;

		if ( ! step && ! lang ) {
			return '/';
		}

		return generatePath( path, {
			step,
			...( lang && langs.includes( lang ) && { lang } ),
		} );
	};
}
