import { localize } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { fetchTranslationsList as fetchWporgTranslationsList } from 'calypso/lib/wporg';
import LanguagePicker from './index';

/*
 * Territories are used in Calypso languages, but they're not in
 * WP.org translations. When displaying a WP.org translation, we need
 * to add a territory to it so it displays in the correct section of
 * calypso's language picker.
	id: 'africa-middle-east',
	subTerritories: [ '145', '002' ],
	--
	name: () => __( 'Americas' ),
	subTerritories: [ '019' ],
	--
	id: 'asia-pacific',
	subTerritories: [ '143', '009', '030', '034', '035' ],
	--
	id: 'eastern-europe',
	subTerritories: [ '151' ],
	--
	id: 'western-europe',
	subTerritories: [ '154', '155', '039' ],
 */
const territoryLookup = {
	ary: '145', // Moroccan Arabic - Africa and Middle East
	azb: '145', // South Azerbaijani - Africa and Middle East
	ceb: '143', // Cebuano - Philippines - Asia-Pacific
	de_CH_informal: '154', // German (Switzerland, Informal) - Western Europe
	de_AT: '154', // German (Austria) - Western Europe
	de_DE_formal: '154', // German (Formal) - Western Europe
	dsb: '154', // Lower Sorbian - Germany - Western Europe
	dzo: '143', // Dzongkha - Bhutan - Asia-Pacific
	en_AU: '143', // English Australia - Asia-Pacific
	en_CA: '019', // English Canada - Americas
	en_ZA: '145', // English South Africa - Africa and Middle East
	en_NZ: '143', // English New Zealand - Asia-Pacific
	es_CR: '019', // Spanish Costa Rica - Americas
	es_EC: '019', // Spanish Ecuador - Americas
	es_VE: '019', // Spanish Venezuela - Americas
	es_UY: '019', // Spanish Uruguay - Americas
	es_PR: '019', // Spanish Puerto Rico - Americas
	es_GT: '019', // Spanish Guatemala - Americas
	es_PE: '019', // Spanish Peru - Americas
	es_CO: '019', // Spanish Colombia - Americas
	es_AR: '019', // Spanish Argentina - Americas
	fa_AF: '145', // Persian (Afghanistan) - Africa and Middle East
	haz: '145', // Hazaragi - Africa and Middle East
	hsb: '154', // Upper Sorbian - Germany - Western Europe
	jv_ID: '143', // Javanese - Asia-Pacific
	my_MM: '143', // Myanmar - Asia-Pacific
	nb_NO: '154', // Norwegian (Bokmål) - Western Europe
	nl_BE: '154', // Dutch (Belgium) - Western Europe
	nl_NL_formal: '154', // Dutch (Formal) - Western Europe
	pt_PT_ao90: '154', // Portuguese (Portugal, AO90) - Western Europe
	pt_AO: '145', // Portuguese (Angola) - Africa and Middle East
	rhg: '143', // Rohingya - Asia-Pacific
	sah: '151', // Sakha - Eastern Europe
	sw: '145', // Swahili - Africa and Middle East
	szl: '151', // Silesian - Eastern Europe
	ta_LK: '143', // Tamil (Sri Lanka) - Asia-Pacific
	tah: '143', // Tahitian - Asia-Pacific
};

const SiteLanguagePicker = localize(
	( { languages: origLanguages, siteIsJetpack, ...restProps } ) => {
		let languages = origLanguages;
		const { data: wporgTranslations, error, isLoading } = useQuery(
			'wporg-translations',
			async () => fetchWporgTranslationsList(),
			{ enabled: siteIsJetpack }
		);

		// Filter the WP.org translations by removing languages also in Calypso
		let wporgOnlyTranslat = [];
		if ( ! error && ! isLoading && wporgTranslations?.translations ) {
			const langSeen = new Set( languages.map( ( l ) => l.wpLocale ) );
			wporgOnlyTranslat = wporgTranslations.translations.filter(
				( l ) => ! langSeen.has( l.language )
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

		if ( siteIsJetpack ) {
			// For jetpack and atomic sites:
			// (1) Remove Calypso-only languages
			// (2) Add WP.org only languages
			languages = languages.filter( ( l ) => l.wpLocale !== '' );
			languages = languages.concat( wporgOnlyLanguages );
		}
		return <LanguagePicker languages={ languages } { ...restProps } />;
	}
);
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
