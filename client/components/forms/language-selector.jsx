/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';
import debugFactory from 'debug';
const	debug = debugFactory( 'calypso:forms:language-selector' );

/**
 * Internal dependencies
 */
import SelectOptGroups from 'components/forms/select-opt-groups';

function coerceToOptions( data, valueKey ) {
	valueKey = 'undefined' === typeof valueKey ? 'value' : valueKey;

	return data.map( function( language ) {
		return { value: language[ valueKey ], label: language.name };
	} );
}

const LanguageSelector = React.createClass( {

	displayName: 'LanguageSelector',

	componentWillMount: function() {
		debug( 'Mounting LanguageSelector React component.' );
	},

	languageOptGroups: function() {
		let popularLanguages;
		const allLanguages = coerceToOptions( this.props.languages, this.props.valueKey );

		popularLanguages = this.props.languages.filter( language => language.popular );
		popularLanguages.sort( ( a, b ) => a.popular - b.popular );
		popularLanguages = coerceToOptions( popularLanguages, this.props.valueKey );

		return [
			{
				label: this.translate( 'Popular languages', { textOnly: true } ),
				options: popularLanguages
			},
			{
				label: this.translate( 'All languages', { textOnly: true } ),
				options: allLanguages
			}
		];
	},

	render: function() {
		const props = omit( this.props, 'languages' );

		return (
			<SelectOptGroups optGroups={ this.languageOptGroups() } { ...props } />
		);
	}
} );

module.exports = LanguageSelector;
