/**
 * External dependencies
 */
import React from 'react';

import LanguagePicker, { Language, LanguageGroup } from '.';

export default { title: 'LanguagePicker' };

const LANGUAGES: Language[] = [
	{
		value: 1,
		langSlug: 'en',
		name: 'English',
		wpLocale: 'en_US',
		popular: 1,
		territories: [ '019' ],
	},
	{ value: 71, langSlug: 'th', name: 'ไทย', wpLocale: 'th', territories: [ '035' ] },

	{ value: 455, langSlug: 'tl', name: 'Tagalog', wpLocale: 'tl', territories: [ '035' ] },
	{ value: 481, langSlug: 'am', name: 'አማርኛ', wpLocale: 'am', territories: [ '002' ] },
	{
		value: 482,
		langSlug: 'en-gb',
		name: 'English (UK)',
		wpLocale: 'en_GB',
		territories: [ '154' ],
	},
];

const LANGUAGE_GROUPS: LanguageGroup[] = [
	{
		id: 'popular',
		name: ( translate ) => translate( 'Popular languages' ),
	},
	{
		id: 'africa-middle-east',
		name: ( translate ) => translate( 'Africa and Middle East' ),
		subTerritories: [ '145', '002' ],
		countries: [ 'AM' ],
	},
	{
		id: 'asia-pacific',
		default: true,
		name: ( translate ) => translate( 'Asia-Pacific' ),
		subTerritories: [ '143', '009', '030', '034', '035' ],
		countries: [ 'TL', 'TH' ],
	},
];

export const _default = () => {
	return (
		<LanguagePicker
			// eslint-disable-next-line no-console
			onSelectLanguage={ ( language ) => console.log( language ) }
			languageGroups={ LANGUAGE_GROUPS }
			languages={ LANGUAGES }
			defaultLananguageGroupId="popular"
		/>
	);
};
