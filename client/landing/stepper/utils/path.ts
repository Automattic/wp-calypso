import { isEnabled } from '@automattic/calypso-config';
import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import { addQueryArgs } from '@wordpress/url';
import { useMatch } from 'react-router-dom';
import { trailingslashit } from 'calypso/lib/route';

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

const getUserStep = (): string => {
	return `/start/account/${ isEnabled( 'signup/social-first' ) ? 'user-social' : 'user' }`;
};

export const getLoginUrl = ( {
	variationName,
	redirectTo,
	pageTitle,
	loginPath,
	locale,
}: {
	/**
	 * Variation name is used to track the relevant login flow in the signup framework as explained in https://github.com/Automattic/wp-calypso/issues/67173
	 */
	variationName?: string | null;
	redirectTo?: string | null;
	pageTitle?: string | null;
	loginPath?: string;
	locale: string;
} ): string => {
	if ( ! loginPath ) {
		loginPath = getUserStep();
	}
	const localizedLoginPath =
		locale && locale !== 'en' ? `${ trailingslashit( loginPath ) }${ locale }` : loginPath;

	// Empty values are ignored down the call stack, so we don't need to check for them here.
	return addQueryArgs( localizedLoginPath, {
		variationName,
		redirect_to: redirectTo,
		pageTitle,
		toStepper: true,
	} );
};

export const useLoginUrl = ( {
	variationName,
	redirectTo,
	pageTitle,
	loginPath,
	locale,
}: {
	/**
	 * Variation name is used to track the relevant login flow in the signup framework as explained in https://github.com/Automattic/wp-calypso/issues/67173
	 */
	variationName?: string | null;
	redirectTo?: string | null;
	pageTitle?: string | null;
	loginPath?: string;
	locale?: string;
} ): string => {
	if ( ! loginPath ) {
		loginPath = getUserStep();
	}
	const currentLocale = useLocale();
	return getLoginUrl( {
		variationName,
		redirectTo,
		pageTitle,
		loginPath,
		locale: locale ?? currentLocale,
	} );
};
