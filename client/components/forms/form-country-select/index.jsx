/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' ),
	classnames = require( 'classnames' ),
	observe = require( 'lib/mixins/data-observe' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormCountrySelect',

	mixins: [ observe( 'countriesList' ) ],

	render: function() {
		var countriesList = this.props.countriesList.get(),
			options = [];

		if ( isEmpty( countriesList ) ) {
			options.push( { key: '', label: this.translate( 'Loading…' ), disabled: 'disabled' } );
		} else {
			options = options.concat( countriesList.map( function( country ) {
					return { key: country.code, label: country.name };
				}
			) );
		}

		return (
			<select
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-country-select' ) }
				onChange={ this.props.onChange }
			>
				{ options.map( function( option ) {
					return <option key={ option.key } value={ option.key } disabled={ option.disabled }>{ option.label }</option>;
				} ) }
			</select>
		);
	}
} );
