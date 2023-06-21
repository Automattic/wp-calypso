import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import { addQueryArgs } from '@wordpress/url';
import { useMatch } from 'react-router-dom';

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

// We remove falsy `steps` with `.filter( Boolean )` as they'd mess up our |-separated route pattern.
export const steps = Object.values( Step ).filter( Boolean );

const routeFragments = {
	// We add the possibility of an empty step fragment through the `?` question mark at the end of that fragment.
	step: `:step(${ steps.join( '|' ) })?`,
	plan: `:plan(${ plansPaths.join( '|' ) })?`,
	lang: `:lang(${ languages.map( ( lang ) => lang.langSlug ).join( '|' ) })?`,
};

export const path = [ '', ...Object.values( routeFragments ) ].join( '/' );

export function useLangRouteParam() {
	const match = useMatch( path );
	return match?.params.lang;
}

export const useLoginUrl = ( params: {
	flowName?: string;
	redirectTo?: string;
	pageTitle?: string;
} ): string => {
	const locale = useLocale();

	const loginPath =
		locale && locale !== 'en' ? `/start/account/user/${ locale }` : `/start/account/user`;

	const nonEmptyQueryParameters = Object.entries( params )
		.filter( ( [ , value ] ) => value )
		.map( ( [ key, value ] ) => {
			switch ( key ) {
				case 'redirectTo':
					return [ 'redirect_to', value ];
				case 'flowName':
					return [ 'variationName', value ];
				default:
					return [ key, value ];
			}
		} );

	return addQueryArgs( loginPath, Object.fromEntries( nonEmptyQueryParameters ) );
};
