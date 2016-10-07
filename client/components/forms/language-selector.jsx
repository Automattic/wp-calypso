/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import SelectOptGroups from 'components/forms/select-opt-groups';

function coerceToOptions( data, valueKey = 'value' ) {
	return data.map( language => ( {
		value: language[ valueKey ],
		label: language.name,
	} ) );
}

const LanguageSelector = props => {
	const { languages, valueKey, translate } = props;
	const allLanguages = coerceToOptions( languages, valueKey );
	let popularLanguages = languages.filter( language => language.popular );
	popularLanguages.sort( ( a, b ) => a.popular - b.popular );
	popularLanguages = coerceToOptions( popularLanguages, valueKey );

	const languageOptGroups = [
		{
			label: translate( 'Popular languages', { textOnly: true } ),
			options: popularLanguages
		},
		{
			label: translate( 'All languages', { textOnly: true } ),
			options: allLanguages
		},
	];

	return <SelectOptGroups optGroups={ languageOptGroups } { ...omit( props, 'languages' ) } />;
};

export default localize( LanguageSelector );
