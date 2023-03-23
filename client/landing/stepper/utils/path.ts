import { Plans } from '@automattic/data-stores';
import languages from '@automattic/languages';
import { useRouteMatch } from 'react-router-dom';

const plansPaths = Plans.plansSlugs;

/**
 * The first step (IntentGathering), which is found at the root route (/), is set as
 * `undefined`, as that's what matching our `path` pattern against a route with no explicit
 * step fragment will return.
 */
export const Step = {
	IntentGathering: undefined,
	DesignSelection: 'design',
	Style: 'style',
	Features: 'features',
	Signup: 'signup',
	Login: 'login',
	CreateSite: 'create-site',
	Domains: 'domains',
	Emails: 'emails',
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
	lang: `:lang(${ languages.map( ( lang ) => lang.langSlug ).join( '|' ) })?`,
};

export const path = [ '', ...Object.values( routeFragments ) ].join( '/' );

export function useLangRouteParam() {
	const match = useRouteMatch< { lang?: string } >( path );
	return match?.params.lang;
}
