/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:forms:language-selector' );
/**
 * Internal dependencies
 */
import { SelectOptGroups } from 'components/forms/select-opt-groups';

function coerceToOptions( data, valueKey ) {
	valueKey = 'undefined' === typeof valueKey ? 'value' : valueKey;

	return data.map( function( language ){
		return { value: language[ valueKey ], label: language.name };
	} );
}

var LanguageSelector = React.createClass( {

	displayName: 'LanguageSelector',

	componentWillMount: function() {
		debug( 'Mounting LanguageSelector React component.' );
	},

	languageOptGroups: function() {
		var allLanguages, popularLanguages;

		allLanguages = coerceToOptions( this.props.languages, this.props.valueKey );

		popularLanguages = this.props.languages.filter( function( language ) { return language.popular; } );
		popularLanguages.sort( function( a, b ) { return a.popular - b.popular; } );
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
		return (
			<SelectOptGroups optGroups={ this.languageOptGroups() } {...this.props} />
		);
	}
});

module.exports = LanguageSelector;
