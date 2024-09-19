import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchTranslationsList as fetchWporgTranslationsList } from 'calypso/lib/wporg';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import territoryLookup from './territory-lookup.js';
import LanguagePicker from './index';

/*
 * <SiteLanguagePicker> is a wrapper around <LanguagePicker> with one additional
 * bit of logic concerning Jetpack and Atomic sites:
 *
 *   - If the currently selected site is a jetpack or atomic site, the component:
 *     - Removes languages from props.languages that WP.Org doesn't support
 *     - Does an API request to WP.org to find additional languages to add to the languages prop
 *     - The goal is to update the list of languages to match /wp-admin/options-general.php on
 *       an atomic or jetpack site.
 *   - If the currently selected site is not a jetpack or atomic site,
 *     no changes are made and we passthrough to <LanguagePicker>.
 *
 * This component is appropriate for using in a site context on /settings/general,
 * but not appropriate on for example, /me/account, which affects calypso in general.
 * Some of the languages we add may not be supported by calypso.
 */
const SiteLanguagePicker = ( { languages: origLanguages, ...restProps } ) => {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const selectedSite = useSelector( getSelectedSite );
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const wpVersion = selectedSite?.options?.software_version;

	let languages = origLanguages;
	// If site is Jetpack or Atomic, do an API request for a list of WP.org translations
	const {
		data: wporgTranslations,
		error,
		isLoading,
	} = useQuery( {
		queryKey: [ 'wporg-translations', wpVersion ],
		queryFn: async () => fetchWporgTranslationsList( wpVersion ),
		enabled: !! siteIsJetpack,
	} );

	// We only need to modify the language list for jetpack or atomic sites
	if ( siteIsJetpack ) {
		// WP.org translations: Keep only the ones that aren't also in Calypso
		let wporgOnlyTranslat = [];
		if ( ! error && ! isLoading && wporgTranslations?.translations ) {
			const calyLangSeen = new Set( languages.map( ( l ) => l.wpLocale ) );
			wporgOnlyTranslat = wporgTranslations.translations.filter(
				( l ) => ! calyLangSeen.has( l.language )
			);
		}

		// Map from WP.org API format to Calypso language format
		const wporgOnlyLanguages = wporgOnlyTranslat.map( ( l ) => ( {
			value: l.language,
			langSlug: l.language,
			name: l.native_name,
			wpLocale: l.language,
			parentLangSlug: null,
			calypsoPercentTranslated: null,
			isTranslatedCompletely: null,
			territories: [ territoryLookup[ l.language ] ],
			revision: null,
		} ) );

		// For jetpack and atomic sites:
		// (1) Remove Calypso-only languages
		// (1a) Some calypso languages don't have a wpLocale set at all.
		languages = languages.filter( ( l ) => l.wpLocale !== '' );

		// (1b) Some calypso languages have a .wpLocale set, but WP.org doesn't
		// have a matching translation, and trying to set an atomic/jetpack
		// site to that language causes an error.
		// Example: Can't set an atomic site to: { langSlug: "br", name: "Brezhoneg", wpLocale: "bre", ... }
		let wpOrgLangSeen = new Set();
		if ( wporgTranslations?.translations ) {
			wpOrgLangSeen = new Set( wporgTranslations.translations.map( ( l ) => l.language ) );
			languages = languages.filter(
				( l ) => wpOrgLangSeen.has( l.wpLocale ) || l.wpLocale === 'en_US'
			);
		}

		// (2) Add WP.org only languages
		languages = languages.concat( wporgOnlyLanguages );
	}
	return <LanguagePicker languages={ languages } { ...restProps } />;
};
export default SiteLanguagePicker;

/*
Example of a translation coming back from the WP.org endpoint:
data.translations[0]
{
  "language": "af",
  "version": "5.8-beta",
  "updated": "2021-05-13 15:59:22",
  "english_name": "Afrikaans",
  "native_name": "Afrikaans",
  "package": "https://downloads.wordpress.org/translation/core/5.8-beta/af.zip",
  "iso": {
    "1": "af",
    "2": "afr"
  },
  "strings": {
    "continue": "Gaan voort"
  }
}

Example of a "language" object used in calypso:
language[0]
{
  "value": 2,
  "langSlug": "af",
  "name": "Afrikaans",
  "wpLocale": "af",
  "parentLangSlug": null,
  "calypsoPercentTranslated": 6,
  "isTranslatedIncompletely": true,
  "territories": [
    "002"
  ],
  "revision": 60516
}
*/
